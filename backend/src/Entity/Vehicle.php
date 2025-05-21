<?php

namespace App\Entity;

use App\Repository\VehicleRepository;
use App\Trait\TimeStampTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: VehicleRepository::class)]
class Vehicle
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['vehicle:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicle:read'])]
    private ?string $registrationNumber = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['vehicle:read'])]
    private ?\DateTime $circulationDate = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read'])]
    private ?string $vin = null;

    #[ORM\Column(type: Types::BIGINT)]
    #[Groups(['vehicle:read'])]
    private ?string $kms = null;

    #[ORM\ManyToOne(targetEntity: Brand::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read'])]
    private Brand $brand;

    #[ORM\ManyToOne(targetEntity: Model::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read'])]
    #[MaxDepth(1)]
    private Model $model;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Client $client;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRegistrationNumber(): ?string
    {
        return $this->registrationNumber;
    }

    public function setRegistrationNumber(string $registrationNumber): static
    {
        $this->registrationNumber = $registrationNumber;

        return $this;
    }

    public function getCirculationDate(): ?\DateTime
    {
        return $this->circulationDate;
    }

    public function setCirculationDate(\DateTime $circulationDate): static
    {
        $this->circulationDate = $circulationDate;

        return $this;
    }

    public function getVin(): ?string
    {
        return $this->vin;
    }

    public function setVin(?string $vin = null): static
    {
        $this->vin = $vin;

        return $this;
    }

    public function getKms(): ?string
    {
        return $this->kms;
    }

    public function setKms(string $kms): static
    {
        $this->kms = $kms;

        return $this;
    }

    public function getBrand(): Brand
    {
        return $this->brand;
    }

    public function setBrand(Brand $brand): static
    {
        $this->brand = $brand;

        return $this;
    }

    public function getModel(): Model
    {
        return $this->model;
    }

    public function setModel(Model $model): static
    {
        $this->model = $model;

        return $this;
    }

    public function getClient(): Client
    {
        return $this->client;
    }

    public function setClient(Client $client): static
    {
        $this->client = $client;

        return $this;
    }

}
