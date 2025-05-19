<?php

namespace App\DataFixtures;

use App\Entity\Garage;
use App\Entity\OperationCategory;
use App\Entity\Operation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('en_US');

        $manager->flush();

        // load garage fixtures
        $this->loadGarage($manager, $faker);

        // load car operations fixtures
        $this->loadCarOperations($manager, $faker);
    }

    private function loadGarage(ObjectManager $manager, $faker): void
    {
        // load garages from file : concessions.csv
        $file = fopen(__DIR__ . '/concessions.csv', 'r');
        if ($file !== false) {
            while (($data = fgetcsv($file, 1000, ';')) !== false) {
                $garage = new Garage();
                $garage->setName($data[0]);
                $garage->setCity($data[1]);
                $garage->setAddress($data[2]);
                $garage->setZipcode($data[3]);
                $garage->setLongitude($data[4]);
                $garage->setLatitude($data[5]);
                $garage->setPhone($faker->phoneNumber());
                $garage->setEmail($faker->email());
                $garage->setTotalWorkers($totalWorker = $faker->numberBetween(1, 10));
                $garage->setAvailableWorkers($faker->numberBetween(1, $totalWorker));
                $garage->setCreationDate(new \DateTimeImmutable());
                $manager->persist($garage);
            }
            fclose($file);
        }

        $manager->flush();
    }

    private function loadCarOperations(ObjectManager $manager, $faker): void
    {
        $file = fopen(__DIR__ . '/car_operations.csv', 'r');
        $categories = [];

        if ($file !== false) {
            while (($data = fgetcsv($file, 1000, ';')) !== false) {
                $categoryName = $data[1];

                // Vérifier si la catégorie existe déjà dans le cache
                if (!isset($categories[$categoryName])) {
                    $category = new Category();
                    $category->setName($categoryName);
                    $manager->persist($category);
                    $categories[$categoryName] = $category;
                } else {
                    $category = $categories[$categoryName];
                }

                $operation = new Operation();
                $operation->setName($data[0]);
                $operation->setCategory($category);
                $operation->setPrice($data[5]);
                $operation->setCreationDate(new \DateTimeImmutable());
                $manager->persist($operation);
            }
            fclose($file);
        }

        $manager->flush();
    }
}
