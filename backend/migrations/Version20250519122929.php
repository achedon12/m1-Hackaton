<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250519122929 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE client ADD society_name VARCHAR(255) DEFAULT NULL, DROP id_client, DROP driver, DROP driver_firstname, DROP driver_lastname, DROP driver_phone, CHANGE firstname firstname VARCHAR(255) DEFAULT NULL, CHANGE lastname lastname VARCHAR(255) DEFAULT NULL, CHANGE birth birth DATE DEFAULT NULL, CHANGE gender gender VARCHAR(255) DEFAULT NULL
        SQL);
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
            ALTER TABLE client ADD id_client INT NOT NULL, ADD driver TINYINT(1) NOT NULL, ADD driver_lastname VARCHAR(255) DEFAULT NULL, ADD driver_phone VARCHAR(255) DEFAULT NULL, CHANGE firstname firstname VARCHAR(255) NOT NULL, CHANGE lastname lastname VARCHAR(255) NOT NULL, CHANGE birth birth DATE NOT NULL, CHANGE gender gender VARCHAR(255) NOT NULL, CHANGE society_name driver_firstname VARCHAR(255) DEFAULT NULL
        SQL);
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
