<?php

namespace App\Controller;

use App\Entity\Bill;
use App\Event\BillCreatedEvent;
use App\Repository\BillRepository;
use App\Repository\MeetingOperationRepository;
use App\Repository\MeetingRepository;
use App\Repository\MeetingStateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/bill', name: 'api_bill_')]
final class BillController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface     $entityManager,
                                private readonly MeetingRepository          $meetingRepository,
                                private readonly MeetingOperationRepository $meetingOperationRepository,
                                private readonly MeetingStateRepository     $meetingStateRepository,
                                private readonly Security                   $security,
                                private readonly EventDispatcherInterface   $eventDispatcher,
                                private readonly BillRepository             $billRepository)
    {
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (!isset($data['meeting'])) {
            return $this->json(['error' => 'Meeting ID is required'], Response::HTTP_BAD_REQUEST);
        }

        $meeting = $this->meetingRepository->find($data['meeting']);
        if (!$meeting) {
            return $this->json(['error' => 'Meeting not found'], Response::HTTP_NOT_FOUND);
        }

        $completedMeetingState = $this->meetingStateRepository->findOneBy(['name' => 'completed']);
        if (!$completedMeetingState) {
            return $this->json(['error' => 'Completed meeting state not found'], Response::HTTP_NOT_FOUND);
        }

        if ($meeting->getMeetingState()->getId() !== $completedMeetingState->getId()) {
            return $this->json(['error' => 'Meeting is not in completed state'], Response::HTTP_BAD_REQUEST);
        }

        $bill = new Bill();
        $bill->setHash(bin2hex(random_bytes(16)));
        $bill->setMeeting($meeting);
        $bill->setCreationDate(new \DateTimeImmutable());
        $bill->setDueDate(new \DateTime('+ 30 days'));

        $this->entityManager->persist($bill);
        $this->entityManager->flush();

        $event = new BillCreatedEvent($bill);
        $this->eventDispatcher->dispatch($event, BillCreatedEvent::NAME);

        return $this->json(
            ['success' => 'Bill created', 'bill' => $bill],
            Response::HTTP_CREATED, [], [
            'groups' => ['bill:read', 'meeting:read']]);
    }

    #[Route('/meeting/{id}', name: 'meeting_bill', methods: ['GET'])]
    public function getMeetingBills(int $id): Response
    {
        $meeting = $this->meetingRepository->find($id);

        if (!$meeting) {
            return $this->json(['error' => 'Meeting not found'], Response::HTTP_NOT_FOUND);
        }

        $bill = $this->billRepository->findBy(['meeting' => $meeting]);
        if (!$bill) {
            return $this->json(['error' => 'No bills found for this meeting'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($bill, Response::HTTP_OK, [], [
            'groups' => ['bill:read', 'meeting:read', 'category:read', 'quotation:read']]);
    }

    #[Route('/{id}', name: 'meeting', methods: ['GET'])]
    public function get(int $id): Response
    {
        $bill = $this->entityManager->getRepository(Bill::class)->find($id);

        if (!$bill) {
            return $this->json(['error' => 'Bill not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($bill, Response::HTTP_OK, [], [
            'groups' => ['bill:read', 'meeting:read', 'category:read', 'quotation:read']]);
    }
}
