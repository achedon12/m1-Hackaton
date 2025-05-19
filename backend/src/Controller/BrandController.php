<?php

namespace App\Controller;

use App\Repository\BrandRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/brand', name: 'api_brand_')]
final class BrandController extends AbstractController
{
    public function __construct(private readonly BrandRepository $brandRepository
    )
    {
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getBrand(int $id): Response
    {
        $brand = $this->brandRepository->find($id);

        if (!$brand) {
            return $this->json(['error' => 'Brand not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($brand, Response::HTTP_OK);
    }

    #[Route('/list', name: 'get', methods: ['GET'])]
    public function getBrands(): Response
    {
        $brands = $this->brandRepository->findAll();

        return $this->json($brands, Response::HTTP_OK);
    }

}
