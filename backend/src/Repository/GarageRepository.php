<?php

namespace App\Repository;

use App\Controller\ClientController;
use App\Entity\Garage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Garage>
 */
class GarageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Garage::class);
    }

    public function findNearby(float $latitude, float $longitude, float $radius): array
    {
        $qb = $this->createQueryBuilder('g')
            ->addSelect(
                '(6371 * ACOS(
                COS(RADIANS(:latitude)) * COS(RADIANS(g.latitude)) *
                COS(RADIANS(g.longitude) - RADIANS(:longitude)) +
                SIN(RADIANS(:latitude)) * SIN(RADIANS(g.latitude))
            )) AS distance'
            )
            ->setParameter('latitude', $latitude)
            ->setParameter('longitude', $longitude)
            ->orderBy('distance', 'ASC');

        if ($radius > 0) {
            $qb->having('distance <= :radius')
                ->setParameter('radius', $radius);
        }

        return $qb->getQuery()->getResult();
    }


    public function findNearbyByZipcode(string $zipcode, string $city, $radius): array
    {
        $coordinates = ClientController::getCoordinatesFromZipcode($zipcode, $city);

        return $this->findNearby($coordinates['longitude'], $coordinates['latitude'], $radius);
    }


    //    /**
    //     * @return Garage[] Returns an array of Garage objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('g')
    //            ->andWhere('g.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('g.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Garage
    //    {
    //        return $this->createQueryBuilder('g')
    //            ->andWhere('g.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
