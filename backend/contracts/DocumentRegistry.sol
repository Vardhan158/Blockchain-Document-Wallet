// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ====================================================================
 * SECTION 69 & 70: EVM SOLIDITY SMART CONTRACT FOR DOCUMENT REGISTRY
 * Hardhat / Ganache / EVM Compatible Smart Contract
 * Zero On-Chain PII: No names, emails, phone numbers, or raw files stored.
 * ====================================================================
 */
contract DocumentRegistry {
    // SECTION 69: CONCEPTUAL DOCUMENT RECORD STRUCT
    struct DocumentRecord {
        bytes32 documentHash; // SHA-256 fingerprint of the unencrypted file
        bytes32 ownerHash;    // Keccak-256 / SHA-256 hash of public User ID (e.g. BDW-9K7F3A2)
        uint8 documentType;   // Enum integer: 1=AADHAAR, 2=PAN, 3=DRIVING_LICENSE, 4=VEHICLE_RC, etc.
        uint8 documentTag;    // Enum integer: 1=VEHICLE, 2=NORMAL
        uint256 verifiedAt;   // On-chain consensus timestamp
        bool valid;           // Active validity status
    }

    // Mapping from documentId bytes32 hash to DocumentRecord
    mapping(bytes32 => DocumentRecord) private registry;

    // Events
    event DocumentRegistered(
        bytes32 indexed docIdHash,
        bytes32 indexed ownerHash,
        bytes32 documentHash,
        uint8 documentTag,
        uint256 verifiedAt
    );

    event DocumentRevoked(bytes32 indexed docIdHash, uint256 revokedAt);

    /**
     * @dev SECTION 69 FUNCTION 1: registerDocument()
     * Registers or updates an approved document's integrity on-chain
     */
    function registerDocument(
        bytes32 docIdHash,
        bytes32 documentHash,
        bytes32 ownerHash,
        uint8 documentType,
        uint8 documentTag
    ) external returns (bool) {
        registry[docIdHash] = DocumentRecord({
            documentHash: documentHash,
            ownerHash: ownerHash,
            documentType: documentType,
            documentTag: documentTag,
            verifiedAt: block.timestamp,
            valid: true
        });

        emit DocumentRegistered(docIdHash, ownerHash, documentHash, documentTag, block.timestamp);
        return true;
    }

    /**
     * @dev SECTION 69 FUNCTION 2: verifyDocument()
     * Verifies if a given document hash matches the recorded smart contract state
     */
    function verifyDocument(
        bytes32 docIdHash,
        bytes32 documentHash
    ) external view returns (bool isValid, uint256 verifiedAt) {
        DocumentRecord memory rec = registry[docIdHash];
        if (rec.valid && rec.documentHash == documentHash) {
            return (true, rec.verifiedAt);
        }
        return (false, 0);
    }

    /**
     * @dev SECTION 69 FUNCTION 3: getDocumentVerification()
     * Retrieves full verification record for a document ID
     */
    function getDocumentVerification(
        bytes32 docIdHash
    )
        external
        view
        returns (
            bytes32 documentHash,
            bytes32 ownerHash,
            uint8 documentType,
            uint8 documentTag,
            uint256 verifiedAt,
            bool valid
        )
    {
        DocumentRecord memory rec = registry[docIdHash];
        return (
            rec.documentHash,
            rec.ownerHash,
            rec.documentType,
            rec.documentTag,
            rec.verifiedAt,
            rec.valid
        );
    }

    /**
     * @dev SECTION 69 FUNCTION 4: revokeDocument()
     * Revokes a document's validity status on-chain
     */
    function revokeDocument(bytes32 docIdHash) external returns (bool) {
        require(registry[docIdHash].valid, "Document is not active or already revoked.");
        registry[docIdHash].valid = false;
        emit DocumentRevoked(docIdHash, block.timestamp);
        return true;
    }
}
