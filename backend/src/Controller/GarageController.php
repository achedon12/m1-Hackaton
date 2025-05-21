<?php

namespace App\Controller;

use App\Entity\Garage;
use App\Repository\GarageRepository;
use App\Repository\MeetingRepository;
use App\Repository\OperationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;
use Twig\Environment;

#[Route('/api/garage', name: 'api_garage_')]
final class GarageController extends AbstractController
{
    public function __construct(private readonly GarageRepository    $garageRepository,
                                private readonly Security            $security,
                                private MailerInterface              $mailer,
                                private Environment                  $twig,
                                private readonly MeetingRepository   $meetingRepository,
                                private readonly OperationRepository $operationRepository)
    {
    }

    #[
        Route('/list', name: 'list', methods: ['GET'])]
    public function getGarages(): Response
    {
        $garages = $this->garageRepository->findAll();

        return $this->json($garages, Response::HTTP_OK);
    }

    #[Route('/availabilities', name: 'availabilities', methods: ['POST'])]
    public function availabilities(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();
        $client = $this->security->getUser();

        $zipcode = $data['zipcode'] ?? $client->getZipcode();
        $city = $data['city'] ?? $client->getCity();
        $operations = $data['operations'];

        $neededTime = 0;
        foreach (explode(";", $data['operations'] ?? []) as $id) {
            $operation = $this->operationRepository->find($id);
            if ($operation) {
                $time = $operation->getEstimatedDuration()->format("H:i:s");
                $time = explode(":", $time);
                $neededTime += ((int)$time[0] * 3600) + ((int)$time[1] * 60) + (int)$time[2];
            }
        }
        $neededTimeFormated = gmdate("H:i:s", $neededTime);

        $coordinates = ClientController::getCoordinatesFromZipcode($zipcode, $city);
        $longitude = $coordinates['longitude'];
        $latitude = $coordinates['latitude'];


        $garages = $this->garageRepository->findNearby($latitude, $longitude, -1);

        $garages = array_map(function ($garage) {
            $garage[0]->distance = round($garage['distance'], 2);

            $garagesMeeting = $this->meetingRepository->findAvailabilitiesTime($garage[0]->getId());
            $garage[0]->workingTime = $garagesMeeting;
            return $garage[0];
        }, $garages);

        $garages = array_slice($garages, 0, 7);

        /** @var Garage $garage */
        foreach ($garages as $garage) {
            if ($garage->getWorkingTime()) {
                // 12:00:00
                $workingTime = explode(":", $garage->getWorkingTime());
                $workingTime = ((int)$workingTime[0] * 3600) + ((int)$workingTime[1] * 60) + (int)$workingTime[2];
                // si workingTime est supérieur à 8h en secondes
                $garage->available = $workingTime <= 3 * 8 * 3600;
                $workingTime = $workingTime / 8 / 3600;
                $garage->setWorkingTime($workingTime);
            }
        }

        return $this->json($garages, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getGarage(int $id): Response
    {
        $garage = $this->garageRepository->find($id);

        if (!$garage) {
            return $this->json(['error' => 'Garage not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($garage, Response::HTTP_OK);
    }

    #[Route('/nearby', name: 'nearby', methods: ['POST'])]
    public function nearby(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (!isset($data['latitude']) || !isset($data['longitude'])) {
            return $this->json(['error' => 'Latitude and longitude are required'], Response::HTTP_BAD_REQUEST);
        }

        $latitude = (float)$data['latitude'];
        $longitude = (float)$data['longitude'];
        $radius = isset($data['radius']) ? (float)$data['radius'] : 50.0;

        if (!is_numeric($latitude) || !is_numeric($longitude)) {
            return $this->json(['error' => 'Invalid latitude or longitude'], Response::HTTP_BAD_REQUEST);
        }

        if (!is_numeric($radius)) {
            return $this->json(['error' => 'Invalid radius'], Response::HTTP_BAD_REQUEST);
        }

        $garages = $this->garageRepository->findNearby($latitude, $longitude, $radius);

        if (empty($garages)) {
            return $this->json(['error' => 'No garages found nearby'], Response::HTTP_NOT_FOUND);
        }

        $garages = array_map(function ($garage) {
            $garage[0]->distance = round($garage['distance'], 2);
            return $garage[0];
        }, $garages);

        return $this->json($garages, Response::HTTP_OK);
    }

    #[Route('/nearbyByZipcode', name: 'nearbyByZipcode', methods: ['POST'])]
    public function nearbyByZipcode(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        $zipcode = $data['zipcode'] ?? null;
        $city = $data['city'] ?? null;

        $radius = isset($data['radius']) ? (float)$data['radius'] : 50.0;

        if (!$zipcode) {
            return $this->json(['error' => 'Zipcode is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!$city) {
            return $this->json(['error' => 'City is required'], Response::HTTP_BAD_REQUEST);
        }

        $garages = $this->garageRepository->findNearbyByZipcode($zipcode, $city, $radius);

        if (empty($garages)) {
            return $this->json(['error' => 'No garages found nearby'], Response::HTTP_NOT_FOUND);
        }

        $garages = array_map(function ($garage) {
            $garage[0]->distance = round($garage['distance'], 2);
            return $garage[0];
        }, $garages);

        return $this->json($garages, Response::HTTP_OK);
    }

    #[Route('/reminder', name: 'reminder', methods: ['POST'])]
    public function reminder(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        $garageId = $data['garage'] ?? null;

        if (!$garageId) {
            return $this->json(['error' => 'Garage is required'], Response::HTTP_BAD_REQUEST);
        }

        $garage = $this->garageRepository->find($garageId);
        if (!$garage) {
            return $this->json(['error' => 'Garage not found'], Response::HTTP_NOT_FOUND);
        }

        $client = $this->security->getUser();
        $message = $data['message'] ?? 'Je souhaite être rappelé par le garage';

        try {
            $reminderEmail = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($garage->getEmail())
                ->subject('New reminder request')
                ->html($this->twig->render('emails/reminder.html.twig', ['client' => $client, 'message' => $message]));

            $this->mailer->send($reminderEmail);

            $reminderConfirmEmail = (new Email())
                ->from('no-reply@rd-vroum.com')
                ->to($client->getEmail())
                ->subject('Reminder request confirmation')
                ->html($this->twig->render('emails/reminderConfirm.html.twig', ['garage' => $garage]));

            $this->mailer->send($reminderConfirmEmail);
        } catch (TransportExceptionInterface) {

        }

        return $this->json(['message' => 'Reminder request sent successfully'], Response::HTTP_OK);
    }
}
