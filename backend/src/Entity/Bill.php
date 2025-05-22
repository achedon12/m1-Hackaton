<?php

namespace App\Entity;

use App\Repository\BillRepository;
use App\Trait\TimeStampTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: BillRepository::class)]
class Bill
{

    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['bill:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['bill:read'])]
    private ?string $hash = null;

    #[ORM\ManyToOne(targetEntity: Meeting::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meeting:read'])]
    private Meeting $meeting;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHash(): ?string
    {
        return $this->hash;
    }

    public function setHash(string $hash): static
    {
        $this->hash = $hash;

        return $this;
    }

    public function getMeeting(): Meeting
    {
        return $this->meeting;
    }

    public function setMeeting(Meeting $meeting): static
    {
        $this->meeting = $meeting;

        return $this;
    }
}
