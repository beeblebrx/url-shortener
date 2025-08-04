import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class UrlShortenerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create VPC with public and private subnets
        const vpc = new ec2.Vpc(this, 'UrlShortenerVpc', {
            maxAzs: 2,
            natGateways: 0, // No NAT gateways as requested
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        // VPC Endpoints for AWS services (to avoid NAT gateway)
        vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
        });

        vpc.addInterfaceEndpoint('EcrEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECR,
        });

        vpc.addInterfaceEndpoint('EcsEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECS,
        });

        vpc.addInterfaceEndpoint('EcsAgentEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECS_AGENT,
        });

        vpc.addInterfaceEndpoint('EcsTelemetryEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
        });

        vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        });

        vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        });

        // S3 Gateway endpoint for ECR image layers
        vpc.addGatewayEndpoint('S3Endpoint', {
            service: ec2.GatewayVpcEndpointAwsService.S3,
        });

        // Create secret for Flask SECRET_KEY
        const flaskSecret = new secretsmanager.Secret(this, 'FlaskSecret', {
            description: 'Flask SECRET_KEY for URL shortener',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'flask' }),
                generateStringKey: 'secret_key',
                excludeCharacters: '"@/\\',
                passwordLength: 32,
            },
        });

        const dbSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
            description: 'Database credentials for URL shortener',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'postgres' }),
                generateStringKey: 'password',
                excludeCharacters: '"@/\\',
            },
        });

        // Database subnet group
        const dbSubnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
            vpc,
            description: 'Subnet group for Aurora cluster',
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
        });

        // Security group for Aurora
        const dbSecurityGroup = new ec2.SecurityGroup(
            this,
            'DatabaseSecurityGroup',
            {
                vpc,
                description: 'Security group for Aurora cluster',
                allowAllOutbound: false,
            }
        );

        // Aurora Serverless v2 cluster
        const cluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
            engine: rds.DatabaseClusterEngine.auroraPostgres({
                version: rds.AuroraPostgresEngineVersion.VER_17_5,
            }),
            credentials: rds.Credentials.fromSecret(dbSecret),
            defaultDatabaseName: 'url_shortener',
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            securityGroups: [dbSecurityGroup],
            serverlessV2MinCapacity: 0.5,
            serverlessV2MaxCapacity: 1,
            writer: rds.ClusterInstance.serverlessV2('writer'),
            removalPolicy: cdk.RemovalPolicy.DESTROY, // This is a hobby project
        });

        // Create SSH key pair for bastion host
        const keyPair = new ec2.KeyPair(this, 'BastionKeyPair', {
            keyPairName: 'url-shortener-bastion-key',
        });

        // Security group for bastion host
        const bastionSecurityGroup = new ec2.SecurityGroup(
            this,
            'BastionSecurityGroup',
            {
                vpc,
                description: 'Security group for bastion host',
                allowAllOutbound: true,
            }
        );

        // Allow SSH access to bastion (restrict this to your IP in production)
        bastionSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'SSH access'
        );

        // Bastion host
        const bastion = new ec2.Instance(this, 'BastionHost', {
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            securityGroup: bastionSecurityGroup,
            keyPair: keyPair,
        });

        // Allow bastion to connect to database
        dbSecurityGroup.addIngressRule(
            bastionSecurityGroup,
            ec2.Port.tcp(5432),
            'Allow bastion to connect to database'
        );

        // ECS Cluster
        const cluster_ecs = new ecs.Cluster(this, 'UrlShortenerCluster', {
            vpc,
            clusterName: 'url-shortener-cluster',
        });

        // CloudWatch log group
        const logGroup = new logs.LogGroup(this, 'UrlShortenerLogGroup', {
            logGroupName: '/ecs/url-shortener',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // ECS Task Definition
        const taskDefinition = new ecs.FargateTaskDefinition(
            this,
            'UrlShortenerTaskDefinition',
            {
                memoryLimitMiB: 512,
                cpu: 256,
            }
        );

        const repositoryFromName = ecr.Repository.fromRepositoryName(
            this,
            'ShortenerRepoName',
            'shortener/url-shortener'
        );

        // Add container to task definition
        const container = taskDefinition.addContainer('UrlShortenerContainer', {
            image: ecs.ContainerImage.fromEcrRepository(
                repositoryFromName,
                'latest'
            ),
            environment: {
                FLASK_ENV: 'production',
                DEFAULT_EXPIRATION_MONTHS: '6',
                SHORT_CODE_LENGTH: '6',
                DATABASE_HOST: cluster.clusterEndpoint.hostname,
                DATABASE_PORT: '5432',
                DATABASE_NAME: 'url_shortener',
                DATABASE_USER: 'postgres',
            },
            secrets: {
                SECRET_KEY: ecs.Secret.fromSecretsManager(
                    flaskSecret,
                    'secret_key'
                ),
                DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(
                    dbSecret,
                    'password'
                ),
            },
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'url-shortener',
                logGroup: logGroup,
            }),
        });

        container.addPortMappings({
            containerPort: 5000,
            protocol: ecs.Protocol.TCP,
        });

        // Security group for ECS service
        const ecsSecurityGroup = new ec2.SecurityGroup(
            this,
            'EcsSecurityGroup',
            {
                vpc,
                description: 'Security group for ECS service',
                allowAllOutbound: true,
            }
        );

        // Allow ECS to connect to database
        dbSecurityGroup.addIngressRule(
            ecsSecurityGroup,
            ec2.Port.tcp(5432),
            'Allow ECS to connect to database'
        );

        // Application Load Balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, 'UrlShortenerALB', {
            vpc,
            internetFacing: true,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });

        // ALB Security Group
        const albSecurityGroup = new ec2.SecurityGroup(
            this,
            'AlbSecurityGroup',
            {
                vpc,
                description: 'Security group for Application Load Balancer',
                allowAllOutbound: true,
            }
        );

        alb.addSecurityGroup(albSecurityGroup);

        // Allow HTTP traffic to ALB
        albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'Allow HTTP traffic'
        );

        // Allow ALB to connect to ECS
        ecsSecurityGroup.addIngressRule(
            albSecurityGroup,
            ec2.Port.tcp(5000),
            'Allow ALB to connect to ECS'
        );

        // Target group
        const targetGroup = new elbv2.ApplicationTargetGroup(
            this,
            'UrlShortenerTargetGroup',
            {
                vpc,
                port: 5000,
                protocol: elbv2.ApplicationProtocol.HTTP,
                targetType: elbv2.TargetType.IP,
                healthCheck: {
                    path: '/health',
                    healthyHttpCodes: '200',
                },
            }
        );

        // ALB Listener
        alb.addListener('UrlShortenerListener', {
            port: 80,
            defaultTargetGroups: [targetGroup],
        });

        // ECS Service
        const service = new ecs.FargateService(this, 'UrlShortenerService', {
            cluster: cluster_ecs,
            taskDefinition,
            desiredCount: 1,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            securityGroups: [ecsSecurityGroup],
        });

        // Attach service to target group
        service.attachToApplicationTargetGroup(targetGroup);

        // Grant permissions to task role
        flaskSecret.grantRead(taskDefinition.taskRole);
        dbSecret.grantRead(taskDefinition.taskRole);

        // Outputs
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: alb.loadBalancerDnsName,
            description: 'DNS name of the load balancer',
        });

        new cdk.CfnOutput(this, 'ECRRepositoryURI', {
            value: repositoryFromName.repositoryUri,
            description: 'ECR Repository URI',
        });

        new cdk.CfnOutput(this, 'BastionHostIP', {
            value: bastion.instancePublicIp,
            description: 'Public IP of the bastion host',
        });

        new cdk.CfnOutput(this, 'DatabaseEndpoint', {
            value: cluster.clusterEndpoint.hostname,
            description: 'Aurora cluster endpoint',
        });

        new cdk.CfnOutput(this, 'KeyPairName', {
            value: keyPair.keyPairName,
            description: 'Name of the SSH key pair for bastion host',
        });
    }
}
