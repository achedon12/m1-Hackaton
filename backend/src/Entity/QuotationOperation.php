<?php

namespace App\Entity;

use App\Repository\QuotationOperationRepository;
use App\Trait\TimeStampTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: QuotationOperationRepository::class)]
class QuotationOperation
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['quotation'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'quotationOperations')]
    #[ORM\JoinColumn(nullable: false)]
    private Quotation $quotation;

    #[ORM\ManyToOne(targetEntity: Operation::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['quotation'])]
    private Operation $operation;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getOperation(): Operation
    {
        return $this->operation;
    }

    public function setOperation(Operation $operation): static
    {
        $this->operation = $operation;

        return $this;
    }

    public function __toString(): string
    {
        return $this->operation->getLibelle();
    }
}
