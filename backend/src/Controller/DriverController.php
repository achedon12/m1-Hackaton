<?php

namespace App\Controller;

use App\Entity\Driver;
use App\Entity\Vehicle;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/driver', name: 'api_driver_')]
final class DriverController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager,
                                private readonly Security               $security)
    {
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getDriver(Driver $driver): Driver
    {
        return $driver;
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function createDriver(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();
        if (!isset($data['driverPhone'], $data['driverFirstname'], $data['driverLastname'])) {
            return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $client = $this->security->getUser();
        if ($client->getId() !== (int) $data['clientId']) {
            return $this->json(['error' => 'You are not authorized to create this driver'], Response::HTTP_FORBIDDEN);
        }

        $vehicle = $this->entityManager->getRepository(Vehicle::class)->find($data['vehicleId']);
        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_NOT_FOUND);
        }

        $existingDriver = $this->entityManager->getRepository(Driver::class)->findOneBy([
            'driverFirstname' => $data['driverFirstname'],
            'driverLastname' => $data['driverLastname'],
            'client' => $client,
        ]);

        if ($existingDriver) {
            return $this->json(['error' => 'Driver already exists'], Response::HTTP_CONFLICT);
        }

        $driver = new Driver();
        $driver->setDriverPhone($data['driverPhone']);
        $driver->setDriverFirstname($data['driverFirstname']);
        $driver->setDriverLastname($data['driverLastname']);
        $driver->setDriver($data['driver'] ?? true);
        $driver->setClient($client);
        $driver->setVehicle($vehicle);
        $driver->setCreationDate(new \DateTimeImmutable());
        $this->entityManager->persist($driver);
        $this->entityManager->flush();
        return $this->json(['message' => 'Driver created successfully'], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'edit', methods: ['PUT'])]
    public function editDriver(Driver $driver, Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();
        if (!isset($data['driverPhone'], $data['driverFirstname'], $data['driverLastname'])) {
            return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        if ($driver->getClient()->getId() !== $this->security->getUser()->getId()) {
            return $this->json(['error' => 'You are not authorized to update this driver'], Response::HTTP_FORBIDDEN);
        }

        $vehicle = $this->entityManager->getRepository(Vehicle::class)->find($data['vehicleId']);
        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_NOT_FOUND);
        }

        $driver->setDriverPhone($data['driverPhone']);
        $driver->setDriverFirstname($data['driverFirstname']);
        $driver->setDriverLastname($data['driverLastname']);
        $driver->setDriver($data['driver'] ?? true);
        $driver->setVehicle($vehicle);
        $this->entityManager->flush();
        return $this->json(['message' => 'Driver updated successfully'], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteDriver(Driver $driver): Response
    {
        if ($driver->getClient()->getId() !== $this->security->getUser()->getId()) {
            return $this->json(['error' => 'You are not authorized to delete this driver'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($driver);
        $this->entityManager->flush();
        return $this->json(['message' => 'Driver deleted successfully'], Response::HTTP_OK);
    }

    #[Route('/vehicle/{id}', name: 'get_by_vehicle', methods: ['GET'])]
    public function getDriversByVehicle(int $id): Response
    {
        $vehicle = $this->entityManager->getRepository(Vehicle::class)->find($id);
        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_NOT_FOUND);
        }

        if ($vehicle->getClient()->getId() !== $this->security->getUser()->getId()) {
            return $this->json(['error' => 'You are not authorized to view this vehicle'], Response::HTTP_FORBIDDEN);
        }

        $drivers = $this->entityManager->getRepository(Driver::class)->findBy(['vehicle' => $vehicle]);
        return $this->json($drivers, Response::HTTP_OK);
    }
}