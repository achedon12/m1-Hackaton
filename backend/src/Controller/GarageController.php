<?php

namespace App\Controller;

use App\Repository\GarageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/garage', name: 'api_garage_')]
final class GarageController extends AbstractController
{
    public function __construct(private readonly GarageRepository $garageRepository
    )
    {
    }

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function getGarages(): Response
    {
        $garages = $this->garageRepository->findAll();

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

        if (!$zipcode) {
            return $this->json(['error' => 'Zipcode is required'], Response::HTTP_BAD_REQUEST);
        }

        $garages = $this->garageRepository->findNearbyByZipcode($zipcode);

        if (empty($garages)) {
            return $this->json(['error' => 'No garages found nearby'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($garages, Response::HTTP_OK);
    }
}
