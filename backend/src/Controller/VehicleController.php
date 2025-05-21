<?php

namespace App\Controller;

use App\Entity\Driver;
use App\Entity\Meeting;
use App\Entity\Vehicle;
use App\Repository\BrandRepository;
use App\Repository\ModelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/vehicle', name: 'api_vehicle_')]
final class VehicleController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager,
                                private readonly ModelRepository $modelRepository,
                                private readonly BrandRepository $brandRepository,
                                private readonly Security $security
    )
    {
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteVehicle(int $id): Response
    {
        $vehicle = $this->entityManager->getRepository(Vehicle::class)->find($id);

        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$vehicle->getClient()->getId() !== $this->security->getUser()->getId()) {
            return $this->json(['error' => 'You are not authorized to update this vehicle'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($vehicle);
        $this->entityManager->flush();

        return $this->json(['message' => 'Vehicle deleted successfully'], Response::HTTP_OK);
    }

    #[Route('/update/{id}', name: 'update', methods: ['PUT'])]
    public function updateVehicle(int $id, Request $request): Response
    {
        $vehicle = $this->entityManager->getRepository(Vehicle::class)->find($id);

        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_NOT_FOUND);
        }

        if ($vehicle->getClient()->getId() !== $this->security->getUser()->getId()) {
            return $this->json(['error' => 'You are not authorized to update this vehicle'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (isset($data['brand'])) {
            $brand = $this->brandRepository->find($data['brand']);
            if (!$brand) {
                return $this->json(['error' => 'Brand not found'], Response::HTTP_BAD_REQUEST);
            }
            $vehicle->setBrand($brand);
        } else {
            $brand = $vehicle->getBrand();
        }

        if (isset($data['model'])) {
            $model = $this->modelRepository->find($data['model']);
            if (!$model) {
                return $this->json(['error' => 'Model not found'], Response::HTTP_BAD_REQUEST);
            }

            if ($model->getBrand()->getId() !== $brand->getId()) {
                return $this->json(['error' => 'This model does not belong to the specified brand'], Response::HTTP_BAD_REQUEST);
            }

            $vehicle->setModel($model);
        }

        if (isset($data['circulationDate'])) {
            $vehicle->setCirculationDate(new \DateTime($data['circulationDate']));
        }
        if (isset($data['kms'])) {
            $vehicle->setKms($data['kms']);
        }
        if (isset($data['registrationNumber'])) {
            $vehicle->setRegistrationNumber($data['registrationNumber']);
        }
        if (isset($data['vin'])) {
            $vehicleByVin = $this->entityManager->getRepository(Vehicle::class)->findOneBy(['vin' => $data['vin']]);

            if ($vehicleByVin) {
                return $this->json(['error' => 'Vehicle with this VIN already exists'], Response::HTTP_BAD_REQUEST);
            }

            $vehicle->setVin($data['vin']);
        }

        $vehicle->setUpdateDate(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json(['message' => 'Vehicle updated successfully'], Response::HTTP_OK);
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function createVehicle(Request $request): Response
    {
        $data = json_decode($request->getContent(), true) ?? $request->request->all();

        if (!isset($data['model'])) {
            return $this->json(['error' => 'Model is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['brand'])) {
            return $this->json(['error' => 'Brand is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['circulationDate'])) {
            return $this->json(['error' => 'Circulation date is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['kms'])) {
            return $this->json(['error' => 'Kms is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!isset($data['registrationNumber'])) {
            return $this->json(['error' => 'Registration number is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!$brand = $this->brandRepository->find($data['brand'])) {
            return $this->json(['error' => 'Brand not found'], Response::HTTP_BAD_REQUEST);
        }

        if (!$model = $this->modelRepository->find($data['model'])) {
            return $this->json(['error' => 'Model not found'], Response::HTTP_BAD_REQUEST);
        }

        // Vérification de la cohérence entre le modèle et la marque
        if ($model->getBrand()->getId() !== $brand->getId() ) {
            return $this->json(['error' => 'This model does not belong to the specified brand'], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['vin'])) {
            $vehicle = $this->entityManager->getRepository(Vehicle::class)->findOneBy(['vin' => $data['vin']]);

            if ($vehicle) {
                return $this->json(['error' => 'Vehicle with this VIN already exists'], Response::HTTP_BAD_REQUEST);
            }
        }

        $vehicle = new Vehicle();
        $vehicle->setModel($model);
        $vehicle->setBrand($brand);
        $vehicle->setCirculationDate(new \DateTime($data['circulationDate']));
        $vehicle->setKms($data['kms']);
        $vehicle->setRegistrationNumber($data['registrationNumber']);
        $vehicle->setVin($data['vin'] ?? null);
        $vehicle->setCreationDate(new \DateTimeImmutable());
        $vehicle->setClient($this->security->getUser());

        $this->entityManager->persist($vehicle);
        $this->entityManager->flush();

        return $this->json(['message' => 'Vehicle created successfully'], Response::HTTP_CREATED);
    }

    #[Route('/client/{id}', name: 'get_by_client', methods: ['GET'])]
    public function getByClient(int $id): Response
    {
        $vehicles = $this->entityManager->getRepository(Vehicle::class)->findBy(['client' => $id]);

        if (!$vehicles) {
            return $this->json(['error' => 'No vehicles found for this client'], Response::HTTP_NOT_FOUND);
        }

        foreach ($vehicles as $vehicle) {
            $brandNameLowercase = strtolower($vehicle->getBrand()->getName());
            $logoPath = 'uploads/brands/' . $brandNameLowercase . '.png';

            $vehicle->getBrand()->setLogoUrl($logoPath);
        }

        return $this->json($vehicles, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getVehicle(int $id): Response
    {
        $vehicle = $this->entityManager->getRepository(Vehicle::class)->find($id);

        if (!$vehicle) {
            return $this->json(['error' => 'Vehicle not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$vehicle->getClient()->getId() !== $this->security->getUser()->getId()) {
            return $this->json(['error' => 'You are not authorized to update this vehicle'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($vehicle, Response::HTTP_OK);
    }
}
