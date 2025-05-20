<?php

namespace App\Controller;

use App\Repository\ModelRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/model', name: 'api_model_')]
final class ModelController extends AbstractController
{
    public function __construct(private readonly ModelRepository $modelRepository
    )
    {
    }

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function getModels(): Response
    {
        $models = $this->modelRepository->findAll();

        return $this->json($models, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getModel(int $id): Response
    {
        $model = $this->modelRepository->find($id);

        if (!$model) {
            return $this->json(['error' => 'Model not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($model, Response::HTTP_OK);
    }

}
