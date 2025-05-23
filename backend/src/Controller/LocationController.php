<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/location', name: 'api_location_')]
final class LocationController extends AbstractController
{

    #[Route('/coordinates/{zipcode}', name: 'coordinates', methods: ['GET'])]
    public function getCoordinatesFromZipcode(string $zipcode): Response
    {
        if (!preg_match('/^\d{5}$/', $zipcode)) {
            return $this->json(['error' => 'Invalid zipcode format.'], Response::HTTP_BAD_REQUEST);
        }

        $coordinates = ClientController::getCoordinatesFromZipcode($zipcode, '');

        if ($coordinates === null) {
            return $this->json(['error' => 'Coordinates not found.'], Response::HTTP_NOT_FOUND);
        }
        return $this->json($coordinates);
    }
}
