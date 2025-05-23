<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/location', name: 'api_location_')]
final class LocationController extends AbstractController
{

    #[Route('/coordinates/{zipcode}', name: 'coordinates', methods: ['GET'])]
    public function getCoordinatesFromZipcode(Request $request, string $zipcode): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (!preg_match('/^\d{5}$/', $zipcode)) {
            return $this->json(['error' => 'Invalid zipcode format.'], Response::HTTP_BAD_REQUEST);
        }

        $city = $data['city'] ?? '';

        $coordinates = ClientController::getCoordinatesFromZipcode($zipcode, $city);

        if ($coordinates === null) {
            return $this->json(['error' => 'Coordinates not found.'], Response::HTTP_NOT_FOUND);
        }
        return $this->json($coordinates, Response::HTTP_OK);
    }
}
