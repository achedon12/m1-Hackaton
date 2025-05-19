<?php

namespace App\Entity;

use App\Repository\QuotationRepository;
use App\Trait\TimeStampTrait;
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

    #[ORM\ManyToOne(targetEntity: QuotationState::class)]
    #[ORM\JoinColumn(nullable: false)]
    private QuotationState $quotationState;

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
}
