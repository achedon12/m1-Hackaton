<?php

namespace App\Controller;

use App\Entity\Client;
use App\Event\ClientCreatedEvent;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Geocoder\Provider\Nominatim\Nominatim;
use Geocoder\Query\GeocodeQuery;
use Geocoder\StatefulGeocoder;
use Http\Discovery\Psr17Factory;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Random\RandomException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\Psr18Client;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;


#[Route('/api/client', name: 'api_client_')]
final class ClientController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface      $entityManager,
                                private readonly Security                    $security,
                                private readonly UserPasswordHasherInterface $userPasswordHasher,
                                private readonly EventDispatcherInterface    $eventDispatcher,
                                private readonly TranslatorInterface         $translator,
                                private readonly SluggerInterface            $slugger,
                                private readonly ClientRepository            $clientRepository
    )
    {
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();
        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Champs requis : email, mot de passe'], 400);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Email invalide'], 400);
        }

        $client = $this->clientRepository->findOneBy(['email' => $data['email']]);
        if (!$client) {
            return new JsonResponse(['error' => 'Client not found'], 404);
        }

        if (!$this->userPasswordHasher->isPasswordValid($client, $data['password'])) {
            return new JsonResponse(['error' => 'Invalid password'], 401);
        }

        $token = $jwtManager->create($client);

        return $this->json([
            'token' => $token,
            'client' => $client
        ], Response::HTTP_OK, [], ['groups' => ['client:read']]);
    }

    /**
     * @throws RandomException
     */
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        Request                  $request,
        JWTTokenManagerInterface $jwtManager,
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['phone']) || !isset($data['city']) || !isset($data['zipcode'])) {
            return new JsonResponse(['error' => 'Champs requis : email, mot de passe, numéro de téléphone, ville, zipcode'], 400);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Email invalide'], 400);
        }

        $result = $this->checkPassword($data['password']);
        if ($result) {
            return $result;
        }

        $existingClient = $this->clientRepository->findOneBy(['email' => $data['email']]);
        if ($existingClient) {
            return new JsonResponse(['error' => 'Cette email est déjà utilisé'], 409);
        }

        $client = new Client();
        $client->setEmail($data['email']);
        $client->setPassword(
            $this->userPasswordHasher->hashPassword($client, $data['password'])
        );

        $client->setFirstname($data['firstname'] ?? null);
        $client->setLastname($data['lastname'] ?? null);
        $client->setLongitude($data['longitude'] ?? null);
        $client->setLatitude($data['latitude'] ?? null);

        if (!$client->getLongitude() || !$client->getLatitude()) {
            $coordinates = self::getCoordinatesFromZipcode($data['zipcode'], $data['city']);
            if ($coordinates) {
                $client->setLatitude($coordinates['latitude']);
                $client->setLongitude($coordinates['longitude']);
            }
        }
        $client->setPhone($data['phone']);
        $client->setCity($data['city']);
        $client->setAddress($data['address'] ?? null);
        $client->setHash(hash('sha256', $data['firstname'] . $data['lastname'] . $data['email'] . $data['phone']));
        $client->setZipcode($data['zipcode']);
        $client->setGender($data['gender'] ?? null);
        $client->setSocietyName($data['societyName'] ?? null);
        $client->setVerifiedAccount(false);
        $client->setVerificationToken(bin2hex(random_bytes(32)));

        if (isset($data['birth']) && $data['birth']) {
            try {
                $newDate = \DateTime::createFromFormat('Y-m-d', $data['birth']);
                $client->setBirth($newDate);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Invalid date format for birth (expected Y-m-d)'], 400);
            }
        }

        $this->uploadAvatar($request, $client);

        $client->setCreationDate(new \DateTimeImmutable());

        $this->entityManager->persist($client);
        $this->entityManager->flush();

        $event = new ClientCreatedEvent($client);
        $this->eventDispatcher->dispatch($event, ClientCreatedEvent::NAME);

        try {
            $token = $jwtManager->create($client);
        } catch (AuthenticationException $e) {
            return new JsonResponse(['error' => 'Échec de génération du token'], 500);
        }

        return $this->json(['client' => $client, 'token' => $token], Response::HTTP_OK, [], ['groups' => ['client:read']]);
    }

    public static function getCoordinatesFromZipcode(string $zipcode, ?string $city): ?array
    {
        $httpClient = HttpClient::create();
        $psr17Factory = new Psr17Factory();
        $httpClient = new Psr18Client($httpClient, $psr17Factory, $psr17Factory);

        $provider = Nominatim::withOpenStreetMapServer($httpClient, 'mon-app/1.0');
        $geocoder = new StatefulGeocoder($provider, 'fr');
        if (!empty($city)){
            $results = $geocoder->geocodeQuery(GeocodeQuery::create($zipcode . ' ' . $city . ' France'));
        }else{
            $results = $geocoder->geocodeQuery(GeocodeQuery::create($zipcode . ' France'));
        }

        return $results->isEmpty() ? null : [
            'latitude' => $results->first()->getCoordinates()->getLatitude(),
            'longitude' => $results->first()->getCoordinates()->getLongitude(),
        ];
    }

    #[Route('/update', name: 'update', methods: ['POST'])]
    public function update(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        $client = $this->security->getUser();

        if (isset($data['firstname'])) {
            $client->setFirstname($data['firstname']);
        }
        if (isset($data['lastname'])) {
            $client->setLastname($data['lastname']);
        }
        if (isset($data['phone'])) {
            $client->setPhone($data['phone']);
        }
        if (isset($data['city'])) {
            $client->setCity($data['city']);
        }
        if (isset($data['zipcode'])) {
            $client->setZipcode($data['zipcode']);
        }
        if (isset($data['gender'])) {
            $client->setGender($data['gender']);
        }
        if (isset($data['societyName'])) {
            $client->setSocietyName($data['societyName']);
        }
        if (isset($data['birth'])) {
            try {
                $newDate = \DateTime::createFromFormat('Y-m-d', $data['birth']);
                $client->setBirth($newDate);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Invalid date format for birth (expected Y-m-d)'], 400);
            }
        }
        if (isset($data['password'])) {
            $result = $this->checkPassword($data['password']);
            if ($result) {
                return $result;
            }
            $client->setPassword(
                $this->userPasswordHasher->hashPassword($client, $data['password'])
            );
        }
        if (isset($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return new JsonResponse(['error' => 'Email invalide'], 400);
            }
            $existingClient = $this->clientRepository->findOneBy(['email' => $data['email']]);
            if ($existingClient && $existingClient->getId() !== $client->getId()) {
                return new JsonResponse(['error' => 'Cette email est déjà utilisé'], 409);
            }
            $client->setEmail($data['email']);
        }

        $this->uploadAvatar($request, $client);
        $client->setUpdateDate(new \DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json(
            [
                'message' => 'Client updated',
                'client' => $client
            ]
        );
    }

    private function checkPassword(string $password): ?JsonResponse
    {
        if (strlen($password) < 8) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 8 caractères'], 400);
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins une majuscule'], 400);

        }
        if (!preg_match('/[0-9]/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins un chiffre'], 400);
        }
        if (!preg_match('/[\W_]/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins un caractère spéciale'], 400);
        }
        return null;
    }

    private function uploadAvatar(Request $request, Client $client, bool $deleteOldAvatar = false): ?JsonResponse
    {
        $files = $request->files->all();
        $avatar = $files['avatar'] ?? null;
        if ($avatar) {
            if ($client->getAvatar() && $deleteOldAvatar) {
                $oldAvatarPath = $this->getParameter('avatars_directory') . '/' . $client->getAvatar();
                if (file_exists($oldAvatarPath)) {
                    unlink($oldAvatarPath);
                }
            }

            $originalFilename = pathinfo($avatar->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $avatar->guessExtension();

            try {
                if ($client->getAvatar()) {
                    $oldAvatarPath = $this->getParameter('avatars_directory') . '/' . $client->getAvatar();
                    if (file_exists($oldAvatarPath)) {
                        unlink($oldAvatarPath);
                    }
                }

                if (!is_dir($avatarDirectory = $this->getParameter('avatars_directory'))) {
                    mkdir($avatarDirectory, 0777, true);
                }
                $avatar->move(
                    $avatarDirectory,
                    $newFilename
                );
                $client->setAvatar($newFilename);

            } catch (FileException $e) {
                return new JsonResponse(['error' => 'Échec de l\'upload de l\'avatar'], 500);
            }
        }
        return null;
    }

    #[Route('/delete', name: 'delete', methods: ['DELETE'])]
    public function delete(): Response
    {
        $client = $this->security->getUser();
        if (!$client) {
            return new JsonResponse(['error' => 'Client not found'], 404);
        }

        $this->entityManager->remove($client);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Client deleted'], 200);
    }
}
