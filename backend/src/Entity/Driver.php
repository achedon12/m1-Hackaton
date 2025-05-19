<?php

namespace App\Entity;

use App\Repository\DriverRepository;
use App\Trait\TimeStampTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DriverRepository::class)]
class Driver
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?bool $driver = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $driverPhone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $driverFirstname = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $driverLastname = null;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Client $client;

    #[ORM\ManyToOne(targetEntity: Vehicle::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Vehicle $vehicle;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isDriver(): ?bool
    {
        return $this->driver;
    }

    public function setDriver(bool $driver): static
    {
        $this->driver = $driver;

        return $this;
    }

    public function getDriverPhone(): ?string
    {
        return $this->driverPhone;
    }

    public function setDriverPhone(string $driverPhone): static
    {
        $this->driverPhone = $driverPhone;

        return $this;
    }

    public function getDriverFirstname(): ?string
    {
        return $this->driverFirstname;
    }

    public function setDriverFirstname(?string $driverFirstname): static
    {
        $this->driverFirstname = $driverFirstname;

        return $this;
    }

    public function getDriverLastname(): ?string
    {
        return $this->driverLastname;
    }

    public function setDriverLastname(?string $driverLastname): static
    {
        $this->driverLastname = $driverLastname;

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

    public function getVehicle(): Vehicle
    {
        return $this->vehicle;
    }

    public function setVehicle(Vehicle $vehicle): static
    {
        $this->vehicle = $vehicle;

        return $this;
    }

    public function __toString(): string
    {
        return $this->driverFirstname . ' ' . $this->driverLastname;
    }
}
