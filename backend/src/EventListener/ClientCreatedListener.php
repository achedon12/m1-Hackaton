<?php

namespace App\EventListener;

use App\Event\ClientCreatedEvent;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

#[AsEventListener(event: ClientCreatedEvent::NAME, method: 'onClientCreated')]
readonly class ClientCreatedListener
{
    public function __construct(private MailerInterface $mailer,
                                private readonly LoggerInterface $logger,
                                private Environment     $twig)
    {
    }

    /**
     * @throws RuntimeError
     * @throws SyntaxError
     * @throws LoaderError
     */
    public function onClientCreated(ClientCreatedEvent $event): void
    {
        $client = $event->getClient();

        $this->logger->info('ClientCreatedEvent triggered for client: ' . $client->getEmail());

        try {
            $email = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($client->getEmail())
                ->subject('Welcome to RD-Vroum!')
                ->html($this->twig->render('emails/registration.html.twig', ['user' => $client, 'signedUrl' => 'http://localhost:8000/client/verify/' . $client->getVerificationToken()]));

            $this->mailer->send($email);
        } catch (TransportExceptionInterface) {
        }
    }
}
