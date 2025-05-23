<?php

namespace App\Entity;

use App\Entity\OperationCategory;
use App\Repository\OperationRepository;
use App\Trait\TimeStampTrait;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: OperationRepository::class)]
class Operation
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?float $price = null;

    #[ORM\Column(length: 255)]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?string $libelle = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?\DateTime $estimatedDuration = null;

    #[ORM\Column]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?int $workerNeeded = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?string $comment = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['meeting:read', 'operation:read'])]
    private ?string $help = null;

    #[ORM\ManyToOne(targetEntity: OperationCategory::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meeting:read', 'operation:read'])]
    private OperationCategory $category;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    public function getEstimatedDuration(): ?\DateTime
    {
        return $this->estimatedDuration;
    }

    public function setEstimatedDuration(\DateTime $estimatedDuration): static
    {
        $this->estimatedDuration = $estimatedDuration;

        return $this;
    }

    public function getWorkerNeeded(): ?int
    {
        return $this->workerNeeded;
    }

    public function setWorkerNeeded(int $workerNeeded): static
    {
        $this->workerNeeded = $workerNeeded;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getHelp(): ?string
    {
        return $this->help;
    }

    public function setHelp(?string $help): static
    {
        $this->help = $help;

        return $this;
    }

    public function getCategory(): OperationCategory
    {
        return $this->category;
    }

    public function setCategory(OperationCategory $category): self
    {
        $this->category = $category;
        return $this;
    }
}
