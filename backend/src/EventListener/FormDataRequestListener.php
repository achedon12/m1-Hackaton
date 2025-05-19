<?php

namespace App\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Mailer\MailerInterface;
use Twig\Environment;

#[AsEventListener(event: 'kernel.request', method: 'onKernelRequest',priority: 10)]
class FormDataRequestListener
{
    public function __construct(private MailerInterface $mailer,
                                private readonly LoggerInterface $logger,
                                private Environment     $twig)
    {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        $this->logger->info('Request received', [
            'method' => $request->getMethod(),
            'uri' => $request->getRequestUri(),
            'headers' => $request->headers->all(),
        ]);


        if ($request->isMethod('PUT') || $request->isMethod('PATCH')) {
            if (str_starts_with($request->headers->get('Content-Type', ''), 'multipart/form-data')) {
                $stream = $request->getContent();
                $boundary = substr($request->headers->get('Content-Type'), strpos($request->headers->get('Content-Type'), "boundary=") + 9);
                $data = [];
                foreach (explode("--" . $boundary, $stream) as $part) {
                    if (empty($part) || $part == "--\r\n") {
                        continue;
                    }
                    if (str_contains($part, 'Content-Disposition: form-data;')) {
                        preg_match('/name="([^"]+)"/', $part, $matches);
                        $name = $matches[1] ?? null;
                        $value = trim(substr($part, strpos($part, "\r\n\r\n") + 4));
                        if ($name) {
                            $data[$name] = $value;
                        }
                    }
                }
                $request->request->add($data);
            }
        }
    }
}