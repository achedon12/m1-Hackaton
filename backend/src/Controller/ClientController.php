<?php

namespace App\Controller;

use App\Entity\Client;
use App\Event\ClientCreatedEvent;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Random\RandomException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;


final class ClientController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager,
                                private readonly Security $security,
                                private readonly UserPasswordHasherInterface $userPasswordHasher,
                                private readonly EventDispatcherInterface $eventDispatcher,
                                private readonly TranslatorInterface $translator,
                                private readonly SluggerInterface $slugger,
                                private readonly ClientRepository $clientRepository
    )
    {
    }

    /**
     * @throws RandomException
     */
    #[Route('/api/client/register', name: 'client_register', methods: ['POST'])]
    public function register(
        Request $request,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['phone']) || !isset($data['city']) || !isset($data['zipcode'])) {
            return new JsonResponse(['error' => 'Champs requis : email, mot de passe, numéro de téléphone, ville, zipcode'], 400);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Email invalide'], 400);
        }

        if (strlen($data['password']) < 8) {
            return new JsonResponse(['error' => 'Le mot de passe doit contenir au moins 8 caractères'], 400);
        }
        if (!preg_match('/[A-Z]/', $data['password'])) {
            return new JsonResponse(['error' => 'Le mot de passe doit contenir au moins une majuscule'], 400);
        }
        if (!preg_match('/[0-9]/', $data['password'])) {
            return new JsonResponse(['error' => 'Le mot de passe doit contenir au moins un chiffre'], 400);
        }
        if (!preg_match('/[\W_]/', $data['password'])) {
            return new JsonResponse(['error' => 'Le mot de passe doit contenir au moins un caractère spéciale'], 400);
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
        $client->setPhone($data['phone']);
        $client->setCity($data['city']);
        $client->setZipcode($data['zipcode'] ?? '');
        $client->setGender($data['gender'] ?? null);
        $client->setSocietyName($data['societyName'] ?? null);
        $client->setVerifiedAccount(false);
        $client->setVerificationToken(bin2hex(random_bytes(32)));

        if (isset($data['birth'])) {
            try {
                $newDate = \DateTime::createFromFormat('Y-m-d', $data['birth']);
                $client->setBirth($newDate);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Invalid date format for birth (expected Y-m-d)'], 400);
            }
        }

        $client->setCreationDate(new \DateTimeImmutable());

        $this->entityManager->persist($client);
        $this->entityManager->flush();

        $event = new ClientCreatedEvent($client);
        $this->eventDispatcher->dispatch($event, ClientCreatedEvent::NAME);

        return new JsonResponse(['message' => 'Client registered'], 201);
    }
}
