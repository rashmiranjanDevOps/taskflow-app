pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-taskflow-read',
                    url: 'https://github.com/rashmiranjanDevOps/taskflow-app.git'
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }

        stage('Validation') {
            steps {
                dir('frontend') {
                    sh 'test -d dist'
                    sh 'test -f dist/index.html'
                    echo 'Validation passed: frontend build artifacts exist.'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully: Checkout → Build → Test → Validation'
        }

        failure {
            echo 'Pipeline failed. Check the Console Output to identify the issue.'
        }
    }
}
