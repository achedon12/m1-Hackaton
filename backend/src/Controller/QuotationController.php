<?php

namespace App\Controller;

use App\Entity\Quotation;
use App\Entity\QuotationOperation;
use App\Event\QuotationCreatedEvent;
use App\Repository\OperationRepository;
use App\Repository\QuotationRepository;
use App\Repository\QuotationStateRepository;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/quotation', name: 'api_quotation_')]
final class QuotationController extends AbstractController
{

    public function __construct(private readonly EntityManagerInterface   $entityManager,
                                private readonly QuotationStateRepository $quotationStateRepository,
                                private readonly Security                 $security,
                                private readonly OperationRepository      $operationRepository,
                                private readonly EventDispatcherInterface $eventDispatcher,
                                private readonly QuotationRepository      $quotationRepository,
                                private readonly SerializerInterface      $serializer,
                                private readonly VehicleRepository        $vehicleRepository)
    {
    }

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function list(): Response
    {
        $quotations = $this->entityManager->getRepository(Quotation::class)->findAll();

        return $this->json($quotations, Response::HTTP_OK, [], ['groups' => ['quotation:read', 'operation:read', 'client:read']]);
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (!isset($data['date'])) {
            return $this->json(['error' => 'Date is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['vehicle'])) {
            return $this->json(['error' => 'Vehicle is required'], Response::HTTP_BAD_REQUEST);
        }

        $client = $this->security->getUser();

        $vehicle = $this->vehicleRepository->find($data['vehicle']);
        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_BAD_REQUEST);
        }

        if ($vehicle->getClient()->getId() !== $client->getId()) {
            return $this->json(['error' => 'Vehicle does not belong to the client'], Response::HTTP_BAD_REQUEST);
        }

        $price = 0;

        $quotation = new Quotation();
        $quotation->setTva(0.20);
        $quotation->setQuotationState($this->quotationStateRepository->findOneBy(['name' => 'created']));
        $quotation->setClient($client);
        $quotation->setHash(bin2hex(random_bytes(16)));
        $quotation->setRequestDate(new \DateTime($data['date']));
        $quotation->setCreationDate(new \DateTimeImmutable());
        $quotation->setVehicle($vehicle);

        $this->entityManager->persist($quotation);

        foreach (explode(";", $data['operations'] ?? []) as $id) {
            $operation = $this->operationRepository->find($id);
            if (!$operation) {
                return $this->json(['error' => 'Operation not found'], Response::HTTP_BAD_REQUEST);
            }
            $price += $operation->getPrice();
            $quotationOperation = new QuotationOperation();
            $quotationOperation->setOperation($operation);
            $quotationOperation->setQuotation($quotation);
            $quotationOperation->setCreationDate(new \DateTimeImmutable());
            $this->entityManager->persist($quotationOperation);

        }

        $quotation->setPrice($price);

        $this->entityManager->persist($quotation);
        $this->entityManager->flush();

        $event = new QuotationCreatedEvent($quotation);
        $this->eventDispatcher->dispatch($event, QuotationCreatedEvent::NAME);

        return $this->json($quotation, Response::HTTP_CREATED, [], ['groups' => ['quotation:read', 'operation:read', 'quotationState:read', 'client:read', 'vehicle:read']]);
    }

    #[Route('/update/{quotationId}', name: 'update', methods: ['PUT'])]
    public function update(int $quotationId, Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        $quotation = $this->quotationRepository->find($quotationId);
        if (!$quotation) {
            return $this->json(['error' => 'Quotation not found'], Response::HTTP_NOT_FOUND);
        }

        if (!isset($data['state'])) {
            return $this->json(['error' => 'Quotation state is required'], Response::HTTP_BAD_REQUEST);
        }

        $quotationState = $this->quotationStateRepository->find($data['state']);
        if (!$quotationState) {
            return $this->json(['error' => 'Quotation state not found'], Response::HTTP_BAD_REQUEST);
        }

        $quotation->setQuotationState($quotationState);
        $quotation->setUpdateDate(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json($quotation, Response::HTTP_OK, [], ['groups' => ['quotation:read', 'operation:read']]);
    }

    #[Route('/client', name: 'getClientsQuotations', methods: ['GET'])]
    public function getClientsQuotation(): Response
    {
        $client = $this->security->getUser();

        if (!$client) {
            return $this->json(['error' => 'Client not found'], Response::HTTP_NOT_FOUND);
        }

        $quotations = $this->entityManager->getRepository(Quotation::class)->findBy(['client' => $client]);

        if (!$quotations) {
            return $this->json(['error' => 'No quotations found for this client'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($quotations, Response::HTTP_OK, [], ['groups' => ['quotation:read', 'operation:read', 'vehicle:read']]);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getQuotation(int $id): Response
    {
        $quotation = $this->entityManager->getRepository(Quotation::class)->find($id);

        if (!$quotation) {
            return $this->json(['error' => 'Quotation not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($quotation, Response::HTTP_OK, [], ['groups' => ['quotation:read', 'operation:read', 'client:read', 'vehicle:read']]);
    }
}
