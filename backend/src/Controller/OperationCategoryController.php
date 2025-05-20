<?php

namespace App\Controller;

use App\Repository\OperationCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/operations/category', name: 'api_operation_category_')]
class OperationCategoryController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private OperationCategoryRepository $operationCategoryRepository,
    ) {}

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function list(): Response
    {
        $operations_categories = $this->operationCategoryRepository->findAll();

        return $this->json($operations_categories, Response::HTTP_OK);
    }
}
