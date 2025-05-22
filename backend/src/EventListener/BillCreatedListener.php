<?php

namespace App\EventListener;

use App\Event\BillCreatedEvent;
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

#[AsEventListener(event: BillCreatedEvent::NAME, method: 'onBillCreated')]
readonly class BillCreatedListener
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
    public function onBillCreated(BillCreatedEvent $event): void
    {
        $bill = $event->getBill();

        $garage = $bill->getMeeting()->getGarage();
        $company = [
            'name' => $garage->getName(),
            'address' => $garage->getAddress(),
            'zipcode' => $garage->getZipcode(),
            'city' => $garage->getCity(),
            'country' => 'France',
        ];

        $operations = $this->quotationOperationRepository->findBy(['quotation' => $bill->getMeeting()->getQuotation()]);

        $html = $this->twig->render('emails/bill.html.twig', [
            'client' => $bill->getMeeting()->getClient(),
            'company' => $company,
            'billID' => $bill->getId(),
            'bill' => $bill->getMeeting()->getQuotation(),
            'request_date' => $bill->getMeeting()->getQuotation()->getRequestDate()->format('d/m/Y'),
            'due_date' => $bill->getDueDate()->format('d/m/Y'),
            'tva_rate' => $bill->getMeeting()->getQuotation()->getTva(),
            'end_date' => date('Y-m-d'),
            'operations' => $operations
        ]);

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();
        $pdfOutput = $dompdf->output();

        $filename = $bill->getHash() . '.pdf';
        $quotationsDirectory = __DIR__ . '/../../public/uploads/bills';
        $filePath = $quotationsDirectory . '/' . $filename;
        if (!is_dir($quotationsDirectory)) {
            mkdir($quotationsDirectory, 0777, true);
        }
        file_put_contents($filePath, $pdfOutput);


        try {
            $email = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($bill->getMeeting()->getClient()->getEmail())
                ->subject('RD-Vroum - Bill')
                ->html('
                    <p>Dear ' . $bill->getMeeting()->getClient()->getFirstName() . ',</p>
                    <p>Your bill has been created successfully. Please find the attached PDF.</p>
                    <p>Best regards,</p>
                    <p>RD-Vroum Team</p>')
                ->attach($pdfOutput, 'facture_' . $bill->getId() . '.pdf', 'application/pdf');

            $this->mailer->send($email);

            $email = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($bill->getMeeting()->getGarage()->getEmail())
                ->subject('RD-Vroum - Bill')
                ->html('
                    <p>Dear ' . $bill->getMeeting()->getGarage()->getName() . ',</p>
                    <p>A new bill has been created for your client ' . $bill->getMeeting()->getClient()->getFirstName() . ' ' . $bill->getMeeting()->getClient()->getLastName() . '.</p>
                    <p>Please find the attached PDF.</p>
                    <p>Best regards,</p>
                    <p>RD-Vroum Team</p>')
                ->attach($pdfOutput, 'facture_' . $bill->getId() . '.pdf', 'application/pdf');

            $this->mailer->send($email);
        } catch (TransportExceptionInterface) {
        }
    }
}