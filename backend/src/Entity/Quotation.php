<?php

namespace App\Entity;

use App\Repository\QuotationRepository;
use App\Trait\TimeStampTrait;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: QuotationRepository::class)]
class Quotation
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $price = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 2)]
    private ?string $tva = null;

    #[ORM\Column]
    private ?DateTime $requestDate = null;

    #[ORM\ManyToOne(targetEntity: QuotationState::class)]
    #[ORM\JoinColumn(nullable: false)]
    private QuotationState $quotationState;

    #[ORM\ManyToOne(targetEntity: Client::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Client $client;

    #[ORM\Column(type: Types::STRING)]
    private ?string $hash = null;

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

}
