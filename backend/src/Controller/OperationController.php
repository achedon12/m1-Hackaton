<?php

namespace App\Controller;

use App\Entity\Operation;
use App\Entity\OperationCategory;
use App\Repository\OperationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/operations', name: 'api_operation_')]
class OperationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private OperationRepository $operationRepository,
    ) {}

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function list(): Response
    {
        $operations = $this->operationRepository->findAll();

        return $this->json(['operations' => $operations], Response::HTTP_OK);
    }

    #[Route('/popular', name: 'popular', methods: ['GET'])]
    public function getMostPopularOperations(): Response
    {
        $operations = $this->operationRepository->findMostPopularOperations();

        $operations = array_map(function ($operation) {
            return $operation[0];
        }, $operations);

        return $this->json($operations, Response::HTTP_OK);
    }


    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        $requiredFields = ['libelle', 'price', 'estimatedDuration', 'workerNeeded', 'category'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->json(['error' => "Field '$field' is required"], Response::HTTP_BAD_REQUEST);
            }
        }

        $category = $this->entityManager->getRepository(OperationCategory::class)->find($data['category']);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $operation = new Operation();
            $operation->setLibelle($data['libelle']);
            $operation->setPrice($data['price']);
            $operation->setEstimatedDuration(new \DateTime($data['estimatedDuration']));
            $operation->setWorkerNeeded((int) $data['workerNeeded']);
            $operation->setComment($data['comment'] ?? null);
            $operation->setHelp($data['help'] ?? null);
            $operation->setCategory($category);

            $operation->setCreationDate(new \DateTimeImmutable());

            $this->entityManager->persist($operation);
            $this->entityManager->flush();

            return $this->json(['message' => 'Operation created successfully'], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to create operation: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/update/{id}', name: 'update', methods: ['PUT'])]
    public function updateOperation(int $id, Request $request): Response
    {
        $operation = $this->operationRepository->find($id);

        if (!$operation) {
            return $this->json(['error' => 'Operation not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['category'])) {
            $category = $this->entityManager->getRepository(OperationCategory::class)->find($data['category']);
            if (!$category) {
                return $this->json(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
            }
            $operation->setCategory($category);
        }

        if (isset($data['libelle'])) {
            $operation->setLibelle($data['libelle']);
        }
        if (isset($data['price'])) {
            $operation->setPrice($data['price']);
        }
        if (isset($data['estimatedDuration'])) {
            $operation->setEstimatedDuration(new \DateTime($data['estimatedDuration']));
        }
        if (isset($data['workerNeeded'])) {
            $operation->setWorkerNeeded((int) $data['workerNeeded']);
        }
        if (isset($data['comment'])) {
            $operation->setComment($data['comment']);
        }
        if (isset($data['help'])) {
            $operation->setHelp($data['help']);
        }

        $operation->setUpdateDate(new \DateTimeImmutable());

        try {
            $this->entityManager->flush();
            return $this->json(['message' => 'Operation updated successfully'], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to update operation: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteOperation(int $id): Response
    {
        $operation = $this->operationRepository->find($id);

        if (!$operation) {
            return $this->json(['error' => 'Operation not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->entityManager->remove($operation);
            $this->entityManager->flush();
            return $this->json(['message' => 'Operation deleted successfully'], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to delete operation: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/category/{id}', name: 'category', methods: ['GET'])]
    public function findByCategory(int $id): Response
    {
        $category = $this->entityManager->getRepository(OperationCategory::class)->find($id);

        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $operations = $this->operationRepository->findBy(['category' => $category]);

        return $this->json($operations, Response::HTTP_OK);
    }
}
