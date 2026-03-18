pipeline {
    agent any

    environment {
        CI = 'true'
        // Credentials from Jenkins
        PDN_USER = credentials('PDN_USER')
        PDN_PASS = credentials('PDN_PASS')
        CSR_USER = credentials('CSR_USER')
        CSR_PASS = credentials('CSR_PASS')

        // URLs
        PDN_URL = 'https://pegalabs.pega.com/ui/system/cddd8f50-0220-47b5-9954-62beb8c85e1b'
        ENV_URL = 'https://bluerosetech01.pegalabs.io/prweb'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Run Playwright Test') {
            steps {
                // Using single quotes and %VAR% to securely pass secrets on Windows
                bat '''
                    set DATA_KEY=Data Variant 1
                    set PDN_URL=%PDN_URL%
                    set ENV_URL=%ENV_URL%
                    set PDN_USER=%PDN_USER%
                    set PDN_PASS=%PDN_PASS%
                    set CSR_USER=%CSR_USER%
                    set CSR_PASS=%CSR_PASS%

                    npx playwright test QuotePolicyProcess/tests/loginTest_v1.spec.js --reporter=html
                '''
            }
        }
    }

    post {
        always {
            // Publish HTML Report
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])

            // Archive all artifacts for download
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*.webm', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*.zip', allowEmptyArchive: true
        }
    }
}
