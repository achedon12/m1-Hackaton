<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250519124351 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE operation ADD category_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE operation ADD CONSTRAINT FK_1981A66D12469DE2 FOREIGN KEY (category_id) REFERENCES operation_category (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_1981A66D12469DE2 ON operation (category_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE operation DROP FOREIGN KEY FK_1981A66D12469DE2
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_1981A66D12469DE2 ON operation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE operation DROP category_id
        SQL);
    }
}
