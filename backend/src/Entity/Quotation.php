<?php

namespace App\Entity;

use App\Repository\QuotationRepository;
use App\Trait\TimeStampTrait;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: QuotationRepository::class)]
class Quotation
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['quotation:read', 'meeting:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['quotation:read'])]
    private ?float $price = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 2)]
    #[Groups(['quotation:read'])]
    private ?string $tva = null;

    #[ORM\Column]
    #[Groups(['quotation:read'])]
    private ?DateTime $requestDate = null;

    #[ORM\ManyToOne(targetEntity: QuotationState::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['quotationState:read'])]
    private QuotationState $quotationState;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['client:read'])]
    private Client $client;

    #[ORM\Column(type: Types::STRING)]
    #[Groups(['quotation:read'])]
    private ?string $hash = null;

    #[ORM\OneToMany(targetEntity: QuotationOperation::class, mappedBy: 'quotation')]
    #[Groups(['quotation:read'])]
    private Collection $quotationOperations;

    #[ORM\ManyToOne(targetEntity: Vehicle::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[MaxDepth(1)]
    #[Groups(['vehicle:read'])]
    private Vehicle $vehicle;

    #[ORM\ManyToOne(targetEntity: Garage::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[MaxDepth(1)]
    #[Groups(['garage:read'])]
    private Garage $garage;

    public function __construct()
    {
        $this->quotationOperations = new ArrayCollection();
    }

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

    public function getTva(): ?string
    {
        return $this->tva;
    }

    public function setTva(string $tva): static
    {
        $this->tva = $tva;

        return $this;
    }

    public function getQuotationState(): ?QuotationState
    {
        return $this->quotationState;
    }

    public function setQuotationState(QuotationState $quotationState): static
    {
        $this->quotationState = $quotationState;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(Client $client): static
    {
        $this->client = $client;

        return $this;
    }

    public function getRequestDate(): ?DateTime
    {
        return $this->requestDate;
    }

    public function setRequestDate(DateTime $requestDate): static
    {
        $this->requestDate = $requestDate;

        return $this;
    }

    public function getHash(): ?string
    {
        return $this->hash;
    }

    public function setHash(?string $hash): void
    {
        $this->hash = $hash;
    }

    /**
     * @return Collection<int, QuotationOperation>
     */
    public function getQuotationOperations(): Collection
    {
        return $this->quotationOperations;
    }

    public function addQuotationOperation(QuotationOperation $quotationOperation): static
    {
        if (!$this->quotationOperations->contains($quotationOperation)) {
            $this->quotationOperations->add($quotationOperation);
            $quotationOperation->setQuotation($this);
        }

        return $this;
    }

    public function removeQuotationOperation(QuotationOperation $quotationOperation): static
    {
        if ($this->quotationOperations->removeElement($quotationOperation)) {
            // set the owning side to null (unless already changed)
            if ($quotationOperation->getQuotation() === $this) {
                $quotationOperation->setQuotation(null);
            }
        }

        return $this;
    }

    public function getVehicle(): ?Vehicle
    {
        return $this->vehicle;
    }

    public function setVehicle(Vehicle $vehicle): static
    {
        $this->vehicle = $vehicle;

        return $this;
    }

    public function getGarage(): ?Garage
    {
        return $this->garage;
    }

    public function setGarage(Garage $garage): static
    {
        $this->garage = $garage;

        return $this;
    }

    public function __toString(): string
    {
        return $this->getId() . ' - ' . $this->getRequestDate()->format('d/m/Y') . ' - ' . $this->getPrice() . '€';
    }

}
