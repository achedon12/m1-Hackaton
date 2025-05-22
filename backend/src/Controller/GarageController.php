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

        $zipcode = $data['zipcode'] ?? $client?->getZipcode();
        $city = $data['city'] ?? $client?->getCity();
        $operationIds = array_filter(explode(';', $data['operations'] ?? ''));

        if (!$zipcode || !$city || empty($operationIds)) {
            return $this->json(['error' => 'Données manquantes.'], Response::HTTP_BAD_REQUEST);
        }

        // Calcul du temps nécessaire total en secondes
        $neededTime = 0;
        foreach ($operationIds as $id) {
            $operation = $this->operationRepository->find($id);
            if ($operation) {
                $duration = $operation->getEstimatedDuration(); // DateTimeInterface
                $neededTime += (int)$duration->format('H') * 3600
                    + (int)$duration->format('i') * 60
                    + (int)$duration->format('s');
            }
        }

        // Géolocalisation
        $coordinates = ClientController::getCoordinatesFromZipcode($zipcode, $city);
        $latitude = $coordinates['latitude'];
        $longitude = $coordinates['longitude'];

        // Recherche des garages proches (limité à 7)
        $garages = $this->garageRepository->findNearby($latitude, $longitude, -1);
        $garages = array_map(function ($garage) {
            $garage[0]->distance = round($garage['distance'], 2);
            return $garage[0];
        }, $garages);
        $garages = array_slice($garages, 0, 7);

        $garagesArray = [];
        foreach ($garages as $garage) {
            // Récupération des meetings déjà planifiés pour ce garage
            $existingMeetings = $this->meetingRepository->findExistingMeetings($garage->getId());

            // Calcul de la prochaine date dispo en tenant compte des meetings et de la durée nécessaire
            $nextAvailableDate = $this->findNextAvailableDate($existingMeetings, $neededTime);

            $garagesArray[] = [
                'id' => $garage->getId(),
                'name' => $garage->getName(),
                'zipcode' => $garage->getZipcode(),
                'city' => $garage->getCity(),
                'address' => $garage->getAddress(),
                'phone' => $garage->getPhone(),
                'email' => $garage->getEmail(),
                'availableWorkers' => $garage->getAvailableWorkers(),
                'totalWorkers' => $garage->getTotalWorkers(),
                'longitude' => $garage->getLongitude(),
                'latitude' => $garage->getLatitude(),
                'distance' => $garage->getDistance(),
                'workingTime' => gmdate('H:i:s', $neededTime),
                'workingTimeInDays' => round($neededTime / 28800, 2),
                'nextAvailableDate' => $nextAvailableDate,
                'available' => $nextAvailableDate !== null && $nextAvailableDate >= (new \DateTime())->format('Y-m-d'),
            ];
        }

        return $this->json($garagesArray, Response::HTTP_OK);
    }

    private function findNextAvailableDate(array $existingMeetings, int $neededTime): ?string
    {
        // On initialise à demain (au lieu d'aujourd'hui)
        $startDate = (new \DateTime())->modify('+1 day');
        $workingSecondsPerDay = 28800; // 8h
        $daysToCheck = 3;

        // Cumuler la charge déjà prise par jour
        $dailyWorkload = [];

        foreach ($existingMeetings as $meeting) {
            $date = (new \DateTime($meeting['meeting_date']))->format('Y-m-d');
            $duration = isset($meeting['duration']) ? $this->convertTimeToSeconds($meeting['duration']) : 0;
            $dailyWorkload[$date] = ($dailyWorkload[$date] ?? 0) + $duration;
        }

        for ($i = 0; $i < $daysToCheck; $i++) {
            $candidateDate = (clone $startDate)->modify("+$i days")->format('Y-m-d');

            if (($dailyWorkload[$candidateDate] ?? 0) >= $workingSecondsPerDay) {
                continue;
            }

            $remainingTime = $neededTime;
            $canSchedule = true;

            for ($j = 0; $j < $daysToCheck - $i; $j++) {
                $dateToCheck = (clone $startDate)->modify("+".($i + $j)." days")->format('Y-m-d');
                $used = $dailyWorkload[$dateToCheck] ?? 0;
                $available = $workingSecondsPerDay - $used;

                if ($available <= 0) {
                    $canSchedule = false;
                    break;
                }

                if ($available >= $remainingTime) {
                    $remainingTime = 0;
                    break;
                } else {
                    $remainingTime -= $available;
                }
            }

            if ($canSchedule && $remainingTime <= 0) {
                return $candidateDate;
            }
        }

        return null;
    }


    /**
     * Convertit un temps "HH:mm:ss" en secondes
     */
    private function convertTimeToSeconds(string $time): int
    {
        [$hours, $minutes, $seconds] = array_map('intval', explode(':', $time));
        return $hours * 3600 + $minutes * 60 + $seconds;
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
