<?php

namespace App\Controller;

use App\Entity\Meeting;
use App\Entity\MeetingOperation;
use App\Repository\GarageRepository;
use App\Repository\MeetingRepository;
use App\Repository\MeetingStateRepository;
use App\Repository\OperationRepository;
use App\Repository\QuotationRepository;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/meeting', name: 'api_meeting_')]
final class MeetingController extends AbstractController
{

    public function __construct(private readonly VehicleRepository      $vehicleRepository,
                                private readonly GarageRepository       $garageRepository,
                                private readonly OperationRepository    $operationRepository,
                                private readonly MeetingRepository      $meetingRepository,
                                private readonly MeetingStateRepository $meetingStateRepository,
                                private readonly QuotationRepository    $quotationRepository,
                                private readonly EntityManagerInterface $entityManager,
                                private readonly Security               $security)
    {
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (!isset($data['vehicle'])) {
            return $this->json(['error' => 'Vehicle is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['garage'])) {
            return $this->json(['error' => 'Garage is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['date'])) {
            return $this->json(['error' => 'Date is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['quotation'])) {
            return $this->json(['error' => 'Quotation is required'], Response::HTTP_BAD_REQUEST);
        }

        $client = $this->security->getUser();

        $vehicle = $this->vehicleRepository->find($data['vehicle']);
        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_BAD_REQUEST);
        }

        if ($vehicle->getClient()->getId() !== $client->getId()) {
            return $this->json(['error' => 'You are not the owner of this vehicle'], Response::HTTP_FORBIDDEN);
        }

        $garage = $this->garageRepository->find($data['garage']);
        if (!$garage) {
            return $this->json(['error' => 'Garage not found'], Response::HTTP_BAD_REQUEST);
        }

        $quotation = $this->quotationRepository->find($data['quotation']);
        if (!$quotation) {
            return $this->json(['error' => 'Quotation not found'], Response::HTTP_BAD_REQUEST);
        }


        $meeting = new Meeting();
        $meeting->setVehicle($vehicle);
        $meeting->setGarage($garage);
        $meeting->setQuotation($quotation);
        $meeting->setMeetingDate($quotation->getRequestDate());
        $meeting->setClient($quotation->getClient());
        $meeting->setMeetingDate(new \DateTime($data['date']));
        $meeting->setMeetingState($this->meetingStateRepository->findOneBy(['name' => 'created']));
        $meeting->setCreationDate(new \DateTimeImmutable());

        $this->entityManager->persist($meeting);

        $operations = $quotation->getQuotationOperations();
        foreach ($operations as $operation) {
            $meetingOperation = new MeetingOperation();
            $meetingOperation->setMeeting($meeting);
            $meetingOperation->setOperation($operation->getOperation());
            $meetingOperation->setCreationDate(new \DateTimeImmutable());
            $this->entityManager->persist($meetingOperation);
            $meeting->addMeetingOperation($meetingOperation);
            $this->entityManager->persist($operation);
        }
        $this->entityManager->flush();

        return $this->json($meeting, Response::HTTP_CREATED, [], ['groups' => ['meeting:read', 'vehicle:read', 'garage:read', 'operation:read']]);
    }

    #[Route('/client/{clientId}', name: 'get', methods: ['GET'])]
    public function getClientOperations(int $clientId): Response
    {
        $client = $this->security->getUser();

        if ($client->getId() !== $clientId) {
            return $this->json(['error' => 'You are not the owner of this vehicle'], Response::HTTP_FORBIDDEN);
        }

        $meetings = $this->meetingRepository->findBy(['client' => $client]);

        return $this->json($meetings, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(int $id): Response
    {
        $meeting = $this->meetingRepository->find($id);

        if (!$meeting) {
            return $this->json(['error' => 'Meeting not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($meeting, Response::HTTP_OK, [], ['groups' => ['meeting:read', 'vehicle:read', 'garage:read', 'operation:read']]);
    }

}
