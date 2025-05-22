<?php

namespace App\Entity;

use App\Repository\GarageRepository;
use App\Trait\TimeStampTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: GarageRepository::class)]
class Garage
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['garage:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['garage:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['garage:read'])]
    private ?string $zipcode = null;

    #[ORM\Column(length: 255)]
    #[Groups(['garage:read'])]
    private ?string $city = null;

    #[ORM\Column(length: 255)]
    #[Groups(['garage:read'])]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['garage:read'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['garage:read'])]
    private ?string $email = null;

    #[ORM\Column]
    #[Groups(['garage:read'])]
    private ?int $availableWorkers = null;

    #[ORM\Column]
    #[Groups(['garage:read'])]
    private ?int $totalWorkers = null;

    #[ORM\Column(length: 255)]
    #[Groups(['garage:read'])]
    private ?string $longitude = null;

    #[ORM\Column(length: 255)]
    #[Groups(['garage:read'])]
    private ?string $latitude = null;


    #[Groups(['garage:read'])]
    public ?string $distance = null;


    #[Groups(['garage:read'])]
    public ?string $workingTime = '00:00:00';

    public ?bool $available = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getZipcode(): ?string
    {
        return $this->zipcode;
    }

    public function setZipcode(string $zipcode): static
    {
        $this->zipcode = $zipcode;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getAvailableWorkers(): ?int
    {
        return $this->availableWorkers;
    }

    public function setAvailableWorkers(int $availableWorkers): static
    {
        $this->availableWorkers = $availableWorkers;

        return $this;
    }

    public function getTotalWorkers(): ?int
    {
        return $this->totalWorkers;
    }

    public function setTotalWorkers(int $totalWorkers): static
    {
        $this->totalWorkers = $totalWorkers;

        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(string $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(string $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getDistance(): ?string
    {
        return $this->distance;
    }

    public function setDistance(?string $distance): void
    {
        $this->distance = $distance;
    }

    public function getWorkingTime(): ?string
    {
        return $this->workingTime;
    }

    public function setWorkingTime(?string $workingTime): void
    {
        $this->workingTime = $workingTime;
    }

    public function __toString(): string
    {
        return $this->name;
    }

}
