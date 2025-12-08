-- Fix Payment Settings in Database
-- This script updates or creates the PaymentSettings record with correct ZarinPal configuration

-- Check if PaymentSettings exists
DO $$
DECLARE
    settings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO settings_count FROM payment_settings;
    
    IF settings_count = 0 THEN
        -- Create new payment settings
        INSERT INTO payment_settings (
            id,
            "zarinpalMerchantId",
            "zarinpalApiKey",
            "zarinpalSandbox",
            "allowBankTransfer",
            "allowCashOnDelivery",
            "minimumOrderAmount",
            "maximumOrderAmount",
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid()::text,
            '34f387ef-3ba2-41ba-85ee-c86813806726',
            '',
            false,
            true,
            true,
            0,
            1000000000,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Payment settings created successfully';
    ELSE
        -- Update existing payment settings
        UPDATE payment_settings 
        SET 
            "zarinpalMerchantId" = '34f387ef-3ba2-41ba-85ee-c86813806726',
            "zarinpalSandbox" = false,
            "updatedAt" = NOW()
        WHERE id = (SELECT id FROM payment_settings LIMIT 1);
        RAISE NOTICE 'Payment settings updated successfully';
    END IF;
END $$;

-- Verify the settings
SELECT 
    id,
    SUBSTRING("zarinpalMerchantId", 1, 8) || '...' as merchant_id_preview,
    LENGTH("zarinpalMerchantId") as merchant_id_length,
    "zarinpalSandbox" as sandbox_mode,
    "allowBankTransfer",
    "allowCashOnDelivery",
    "createdAt",
    "updatedAt"
FROM payment_settings;

