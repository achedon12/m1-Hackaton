<?php

namespace App\EventListener;

use App\Event\ClientCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

#[AsEventListener(event: ClientCreatedEvent::NAME, method: 'onUserCreated')]
readonly class ClientCreatedListener
{
    public function __construct(private MailerInterface $mailer,
                                private Environment     $twig)
    {
    }

    /**
     * @throws RuntimeError
     * @throws SyntaxError
     * @throws LoaderError
     */
    public function onUserCreated(ClientCreatedEvent $event): void
    {
        $user = $event->getUser();

        try {
            $email = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($user->getEmail())
                ->subject('Welcome to RD-Vroum!')
                //TODO: faire process token
                ->html($this->twig->render('emails/registration.html.twig', ['user' => $user, 'signedUrl' => 'http://localhost:1081/user/verify/' . 'process_token_a_faire'/*$user->getVerificationToken()*/]));

            $this->mailer->send($email);
        } catch (TransportExceptionInterface) {
        }
    }
}
