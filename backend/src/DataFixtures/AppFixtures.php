<?php

namespace App\DataFixtures;

use App\Entity\Brand;
use App\Entity\Garage;
use App\Entity\MeetingState;
use App\Entity\Model;
use App\Entity\Operation;
use App\Entity\OperationCategory;
use App\Entity\QuotationState;
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

        // load vehicle brand and models
        $this->loadVehicleBrandAndModels($manager, $faker);

        // load meeting state
        $this->loadMeetingState($manager);

        // load quotation state
        $this->loadQuotationState($manager);
    }

    private function loadGarage(ObjectManager $manager, $faker): void
    {
        // load garages from file : concessions.csv
        $file = fopen(__DIR__ . '/concessions.csv', 'r');
        if ($file !== false) {
            while (($data = fgetcsv($file, 1000, ';')) !== false) {
                if ($data[0] === 'dealership_name') {
                    continue;
                }
                $garage = new Garage();
                $garage->setName($data[0]);
                $garage->setCity($data[1]);
                $garage->setAddress($data[2]);
                $garage->setZipcode($data[3]);
                $garage->setLatitude($data[4]);
                $garage->setLongitude($data[5]);
                $garage->setPhone($faker->phoneNumber());
                $garage->setEmail($faker->email());
                $garage->setTotalWorkers(1);
                $garage->setAvailableWorkers(1);
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
                $operation->setEstimatedDuration((new \DateTime())->setTime((int)$data[4], 0));
                $operation->setPrice(round((float)$data[5], 2));
                $operation->setWorkerNeeded($faker->numberBetween(1, 2));
                $operation->setCreationDate(new \DateTimeImmutable());
                $manager->persist($operation);
            }
            fclose($file);
        }

        $manager->flush();
    }

    private function loadVehicleBrandAndModels(ObjectManager $manager, $faker): void
    {
        $data = json_decode(file_get_contents(__DIR__ . '/car-list.json'), true);

        usort($data, function ($a, $b) {
            $brandComparison = strcmp($a['brand'], $b['brand']);
            if ($brandComparison === 0) {
                return strcmp($a['models'][0] ?? '', $b['models'][0] ?? '');
            }
            return $brandComparison;
        });

        foreach ($data as $element) {
            $brand = new Brand();
            $brand->setName($element['brand']);
            $brand->setCreationDate(new \DateTimeImmutable());

            $manager->persist($brand);

            foreach ($element['models'] as $m) {
                $model = new Model();
                $model->setName($m);
                $model->setBrand($brand);
                $model->setCreationDate(new \DateTimeImmutable());
                $manager->persist($model);
            }
        }

        $manager->flush();
    }

    private function loadMeetingState(ObjectManager $manager): void
    {
        $states = [
            'created',
            'confirmed',
            'cancelled',
            'completed',
        ];

        foreach ($states as $state) {
            $meetingState = new MeetingState();
            $meetingState->setName($state);
            $meetingState->setCreationDate(new \DateTimeImmutable());
            $manager->persist($meetingState);
        }

        $manager->flush();
    }

    private function loadQuotationState(ObjectManager $manager): void
    {
        $states = [
            'created',
            'sent',
            'accepted',
            'refused',
        ];

        foreach ($states as $state) {
            $quotationState = new QuotationState();
            $quotationState->setName($state);
            $quotationState->setCreationDate(new \DateTimeImmutable());
            $manager->persist($quotationState);
        }

        $manager->flush();
    }
}
