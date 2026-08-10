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
    }
}
