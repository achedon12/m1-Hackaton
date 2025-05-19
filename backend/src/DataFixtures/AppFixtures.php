<?php

namespace App\DataFixtures;

use App\Entity\Garage;
use App\Entity\OperationCategory;
use App\Entity\Operation;
use DateTime;
use DateTimeImmutable;
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
                if ($data[0] === '﻿operation_name') {
                    continue;
                }
                $categoryName = $data[1];

                if (!isset($categories[$categoryName])) {
                    $category = new OperationCategory();
                    $category->setName($categoryName);
                    $category->setCreationDate(new \DateTimeImmutable());
                    $manager->persist($category);
                    $categories[$categoryName] = $category;
                } else {
                    $category = $categories[$categoryName];
                }

                $operation = new Operation();
                $operation->setLibelle($data[0]);
                $operation->setCategory($category);
                $operation->setHelp($data[2] === 'NULL' ? null : $data[2]);
                $operation->setComment($data[3] === 'NULL' ? null : $data[3]);
                $operation->setEstimatedDuration((new \DateTime())->setTime((int)$data[4], 0));                $operation->setPrice(round((float)$data[5], 2));
                $operation->setWorkerNeeded($faker->numberBetween(1, 2));
                $operation->setCreationDate(new \DateTimeImmutable());
                $manager->persist($operation);
            }
            fclose($file);
        }

        $manager->flush();
    }
}
