<?php

namespace App\Entity;

use App\Repository\MeetingRepository;
use App\Trait\TimeStampTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MeetingRepository::class)]
class Meeting
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTime $meetingDate = null;

    #[ORM\ManyToOne(targetEntity: Vehicle::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Vehicle $vehicle;

    #[ORM\ManyToOne(targetEntity: Quotation::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Quotation $quotation;

    #[ORM\ManyToOne(targetEntity: MeetingState::class)]
    #[ORM\JoinColumn(nullable: false)]
    private MeetingState $meetingState;

    #[ORM\ManyToOne(targetEntity: Garage::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Garage $garage;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Client $client;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMeetingDate(): ?\DateTime
    {
        return $this->meetingDate;
    }

    public function setMeetingDate(\DateTime $meetingDate): static
    {
        $this->meetingDate = $meetingDate;

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

    public function getQuotation(): Quotation
    {
        return $this->quotation;
    }

    public function setQuotation(Quotation $quotation): static
    {
        $this->quotation = $quotation;

        return $this;
    }

    public function getMeetingState(): MeetingState
    {
        return $this->meetingState;
    }

    public function setMeetingState(MeetingState $meetingState): static
    {
        $this->meetingState = $meetingState;

        return $this;
    }

    public function getGarage(): Garage
    {
        return $this->garage;
    }

    public function setGarage(Garage $garage): static
    {
        $this->garage = $garage;

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

    public function __toString(): string
    {
        return $this->meetingDate->format('Y-m-d H:i:s') . ' - ' . $this->client->getFirstname() . ' - ' . $this->client->getLastname();
    }
}
