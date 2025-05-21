<?php

namespace App\Repository;

use App\Entity\Meeting;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Meeting>
 */
class MeetingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Meeting::class);
    }

    public function findAvailabilitiesTime(int $garage): string
    {
        $sql = "
        SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(o.estimated_duration))) AS totalDuration
        FROM meeting m
        JOIN meeting_operation mo ON mo.meeting_id = m.id
        JOIN operation o ON o.id = mo.operation_id
        WHERE m.garage_id = :garage and m.meeting_date > NOW()
    ";

        $result = $this->getEntityManager()
            ->getConnection()
            ->executeQuery($sql, ['garage' => $garage])
            ->fetchAssociative();

        return $result['totalDuration'] ?? '00:00:00';
    }




    //    /**
    //     * @return Meeting[] Returns an array of Meeting objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('m.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Meeting
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
