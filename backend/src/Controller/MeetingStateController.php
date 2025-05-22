<?php

namespace App\Controller;

use App\Repository\MeetingStateRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/meetingstate', name: 'api_meeting_state_')]
final class MeetingStateController extends AbstractController
{

    public function __construct(private readonly MeetingStateRepository $meetingStateRepository)
    {
    }

    #[Route('/list', name: 'get', methods: ['GET'])]
    public function list(): Response
    {
        $meetingStates = $this->meetingStateRepository->findAll();

        if (!$meetingStates) {
            return $this->json(['error' => 'No meeting states found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($meetingStates, Response::HTTP_OK);
    }
}
