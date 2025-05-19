<?php

namespace App\Controller;

use App\Entity\Client;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

final class RegistrationController extends AbstractController
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

    #[Route('/client/verify/{token}', name: 'app_account_confirmation')]
    public function verifyAccount(string $token): Response
    {
        $client = $this->entityManager->getRepository(Client::class)->findOneBy(['verificationToken' => $token]);

        if ($client) {
            $client->setVerifiedAccount(true)
                ->setVerificationToken(null);

            $this->entityManager->flush();

            return $this->render('registration/verified.html.twig');
        } else {
            return $this->render('registration/invalid_token.html.twig');
        }
    }
}
