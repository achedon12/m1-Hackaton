<?php

namespace App\Controller;

use App\Entity\Client;
use App\Event\ClientCreatedEvent;
use Doctrine\ORM\EntityManagerInterface;
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
                                private readonly SluggerInterface $slugger
    )
    {
    }

    #[Route('/api/client/register', name: 'client_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Missing required fields: email, password'], 400);
        }

        $client = new Client();
        $client->setEmail($data['email']);
        $client->setPassword(
            $passwordHasher->hashPassword($client, $data['password'])
        );

        $client->setFirstname($data['firstname'] ?? null);
        $client->setLastname($data['lastname'] ?? null);
        $client->setPhone($data['phone'] ?? '');
        $client->setCity($data['city'] ?? '');
        $client->setZipcode($data['zipcode'] ?? '');
        $client->setGender($data['gender'] ?? null);
        $client->setSocietyName($data['societyName'] ?? null);

        if (isset($data['birth'])) {
            try {
                $newDate = \DateTime::createFromFormat('Y-m-d', $data['birth']);
                $client->setBirth($newDate);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Invalid date format for birth (expected Y-m-d)'], 400);
            }
        }

        $client->setCreationDate(new \DateTimeImmutable());

        $em->persist($client);
        $em->flush();

        $event = new ClientCreatedEvent($client);
        $this->eventDispatcher->dispatch($event, ClientCreatedEvent::NAME);

        return new JsonResponse(['message' => 'Client registered'], 201);
    }
}
