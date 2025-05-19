<?php

namespace App\EventListener;

use App\Event\QuotationCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

#[AsEventListener(event: QuotationCreatedEvent::NAME, method: 'onUserCreated')]
readonly class QuotationCreatedListener
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
    public function onUserCreated(QuotationCreatedEvent $event): void
    {
        $user = $event->getUser();

        try {
            $email = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($user->getEmail())
                ->subject('RD-Vroum - Quotation')
                ->html($this->twig->render('emails/quotation.html.twig', ['user' => $user]));

            $this->mailer->send($email);
        } catch (TransportExceptionInterface) {
        }
    }
}
