<?php

namespace App\EventListener;

use App\Event\QuotationCreatedEvent;
use App\Repository\OperationRepository;
use App\Repository\QuotationOperationRepository;
use Dompdf\Dompdf;
use Dompdf\Options;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

#[AsEventListener(event: QuotationCreatedEvent::NAME, method: 'onQuotationCreated')]
readonly class QuotationCreatedListener
{
    public function __construct(
        private MailerInterface                       $mailer,
        private Environment                           $twig,
        private readonly QuotationOperationRepository $quotationOperationRepository,
        private readonly OperationRepository          $operationRepository,
        private readonly LoggerInterface              $logger
    )
    {
    }

    /**
     * @throws RuntimeError
     * @throws SyntaxError
     * @throws LoaderError
     */
    public function onQuotationCreated(QuotationCreatedEvent $event): void
    {
        $quotation = $event->getQuotation();

        $garage = $quotation->getGarage();
        $company = [
            'name' => $garage->getName(),
            'address' => $garage->getAddress(),
            'zipcode' => $garage->getZipcode(),
            'city' => $garage->getCity(),
            'country' => 'France',
        ];

        $operations = $this->quotationOperationRepository->findBy(['quotation' => $quotation]);

        $html = $this->twig->render('emails/quotation.html.twig', [
            'client' => $quotation->getClient(),
            'company' => $company,
            'quotation' => $quotation,
            'request_date' => $quotation->getRequestDate()->format('d/m/Y'),
            'tva_rate' => $quotation->getTva(),
            'operations' => $operations
        ]);

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();
        $pdfOutput = $dompdf->output();

        $filename = $quotation->getHash() . '.pdf';
        $quotationsDirectory = __DIR__ . '/../../public/uploads/quotations';
        $filePath = $quotationsDirectory . '/' . $filename;
        if (!is_dir($quotationsDirectory)) {
            mkdir($quotationsDirectory, 0777, true);
        }
        file_put_contents($filePath, $pdfOutput);


        try {
            $email = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($quotation->getClient()->getEmail())
                ->subject('RD-Vroum - Quotation')
                ->html('
                    <p>Dear ' . $quotation->getClient()->getFirstName() . ',</p>
                    <p>Your quotation has been created successfully. Please find the attached PDF.</p>
                    <p>Best regards,</p>
                    <p>RD-Vroum Team</p>')
                ->attach($pdfOutput, 'devis_' . $quotation->getId() . '.pdf', 'application/pdf');

            $this->mailer->send($email);
        } catch (TransportExceptionInterface) {
        }
    }
}