<?php

namespace App\Controller;

use App\Entity\Meeting;
use App\Repository\GarageRepository;
use App\Repository\MeetingRepository;
use App\Repository\MeetingStateRepository;
use App\Repository\OperationRepository;
use App\Repository\QuotationRepository;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
                                private readonly EntityManagerInterface $entityManager)
    {
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        // vehicle, garage, operations, rdv_date

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

        $vehicle = $this->vehicleRepository->find($data['vehicle']);
        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_BAD_REQUEST);
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

        // save meeting operations

        $this->entityManager->persist($meeting);
        $this->entityManager->flush();

        return $this->json($meeting, Response::HTTP_CREATED, ['groups' => ['meeting']]);
    }
}
