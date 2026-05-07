// arn:aws:lambda:us-east-1:549143892196:function:testprocesspur

// arn:aws:lambda:us-east-1:549143892196:function:testprocessrefund

// 1. go global on minutes - just one click before deploying and making product avaliable globally
// 2. do not waste money on hardware - just focusing on app development
// 3. get benefits from massive scale business - volume discount causing lower pay as you go payments
// 4. speed and agility - all services in place to help fast adding product to market
// 5. do not have to guess capacity - one just can create and use as many capacity as need for now, no upfront commitments
// 6. can exchange capital expendetures to operating expenses - do not have to make big payments upfront, can pay for what is needed now

const fourBenefits = {
  highAvaliability:
    "softwares deployed to cloud are highly avaliable - taking care of failures, minimizing effects of failures, possibility to route balancing to avoid dead services",
  elasticity:
    "you do not have to pay for capacity from upfront, you do not have to know how much of this you will need, you pay for what you need now",
  agility:
    "cloud gives you all services needed to innovate quickly and deliver faster",
  durability: "mostly about data persistence",
};

const awsVocabulary = {
  AccessControlList: {
    ACL: "firewall/security layer on subnet",
  },
  AutoScaling:
    "automated adding or removing ec2 instances based on trafic for application",
  Buckets: "root level folder for s3",
  CloudFront: {
    CDN: "content delivery network, that allows to store FE content on edge locations - pages are loading faster",
  },
  CloudTrail: "Monitoring tool to spy on actions taken by IAM user",
  CloudWatch:
    "Service for gathering and getting application logs, inspecting applications and ec2 instances load etc, - monitoring various elements of AWS account, possible to set alarms on multiple events",
  ConsolidatedBilling:
    "lets company to view, manage and pay bill for multiple accounts in one place and one user interface",
  DNSServer: "database of website domains matching with their IP addresses",
  DynamoDB: {
    freetier: "",
    structure: ["table", "item", "globalSecondaryIndex"],
    desc: "fast NoSQL database - key value pair,it does not provide other nosql db services only dynamodb",
    additional: [
      "scales automatically to massiwe workloads",
      "we can manually set throughput",
      "fast performance",
      "fully managed",
      "serverless",
    ],
  },
  ElasticBlockStore: {
    EBS: "persistent block storage to use with EC2 instances",
    additional: [
      "works like a pendrive",
      "is persisting even when EC2 instance is down",
      "can be attached or removed from EC2 instance (just like pendrive)",
      "is tied to only ONE AZ",
      "attached to ONLY ONE EC2 in THE SAME TIME",
      "qucikly accessible",
      "long-term data storage",
    ],
  },
  ElacticComputeCloud: {
    EC2: "virtual machine, similar to desktop/laptop",
    freeTier: "750 compute hours per month",
    additional: [
      "provisioning by click of button",
      "preconfigured template AMI - Amazon Machine Image",
      "you can deploy applications to EC@ instance",
      "deploying db to EC2 gives full control over the db - you have to manage it unlike in serverless solutions",
      "can deploy web app to EC2 instance into multiple AZ to make it more avaliable",
      "ELB - elsatic load balancing between multiple EC2 instances",
      "Auto scaling - adding new instances automatically across AZs depending on need and demand",
      "Horizontal scaling is not the same as vertical scaling - horizontal scaling is adding new replicas of EC2, vertical scaling is adding more power like CPU and RAM to existing server",
    ],
    pricingOptions: [
      { onDemand: "pay as you go option, with fixed price, up to second" },
      {
        spot: "cheapest option - you have running instance when the resources are freed",
      },
      {
        reservedInstance:
          "have to sign contract, hug saving comparing to on demand, getting instance for 1 or 3 years",
        payments: ["allUpfront", "partialUprfront", "noUpfront"],
      },
      {
        dedicatedHosts:
          "you have server instance dedicated to you, this server then is not shared with other customers",
      },
      {
        savingPlans:
          "you are commiting to compute usage (per hour) for 1 or 3 years, this can be used for various compute services - EC2, Lambda, Fargate",
      },
    ],
    InstanceStorage: {
      description:
        "local storage that is physically attached to EC2 and cannot be removed",
      additional: [
        "like a disk on a computer",
        "faster - high i/0 speed",
        "it is temporary as it is possible to lost this data when EC2 instance is stopped",
      ],
    },
  },
  ElasticLoadBalancing: {
    ELB: "distributes traffic between EC2 instances that are assotiated with it",
  },
  Elasticache: {
    description:
      "Data caching service, helps to speed up web applications running on AWS",
    additional: [
      "super fast data store used as a database cache",
      "sub milisecond response",
      "good for ephemeral data",
    ],
  },
  Elasticity: "Ability to increase and decreasein size of system",
  FaultTollerance:
    "possibility for system/application to continue working normally if one or more components failed",
  Firewall: "software allowing or blocking internet traffic through it",
  Folder: "any subfolder in main bucker",
  HighAvailability:
    "systems are durable and are working continusly for a long time without failure",
  IAMUsers: {
    users: "users that has been granted access to AWS account",
    additional: [
      "should have mfa",
      "should be added to groups to ensure that they have correct rights",
      "can have possibility to login via username/password or to operate via AWS CLI",
    ],
  },
  IdentityAndAccessManagement: {
    IAM: "sesrvice to manage users and giving them accesses and rights",
    additional: [
      "define who can do what",
      "define who has access where",
      "free and global service",
      {
        identities: ["root user", "individual users", "groups", "roles"],
        access: [
          "policies",
          "AWS managed policies",
          "customer managed policies",
          "Permissions boundaries",
        ],
        authentication: "who",
        authorization: "what",
      },
    ],
  },
  Lambda: {
    description:
      "serverless computing, replacing EC2 lambda, single function, that can be invoked, grouped with, 15 minutes timeout, managed by AWS, different version of popula languages ",
  },
  ObjectAvailability:
    "percent by one year when the file will be accessible via s3",
  ObjectDurability:
    "percent  by one year when the file stored on s3 won't be lost",
  ObjectLifecycle:
    "rules describing transfers of object between storage classes over a time",
  ObjectSharing: "making an object accessible to public via url",
  ObjectVersioning: "keeping multiple versions of an object",
  Organizations: "Allowing to manage access and billing of multiple accounts",
  PrincipleOfLeastPrivilege:
    "Giving access and rights only for what should be done by user and for nothing more",
  Publishers: "Human/alarm/event that is triggering SNS to send message",
  RelationalDatabaseService: {
    RDS: "SQL DB service",
    additional: [
      "MULTI AZ",
      "high availability and fault tolerance",
      "it is managed by AWS - patching, software updates, automated backups etc",
      "there is possibility to launch replicas across different regions for better performance",
    ],
    supportedDatabases: [
      "Aurora",
      "Postgres",
      "MySQL",
      "MariaDB",
      "ORACLE",
      "MS SQL Server",
    ],
  },
  Redshift: {
    description: "scalable data warehouse for exabytes of data",
    additional: ["fast and efficient", "exabyte scale"],
  },
  Roles:
    "granting permission for users/services to perform actions on other services etc",
  Route53:
    "DNS service - where you specify domains for apps and webpages stored on AWS",
  Scalability: "",
  SecurityGroup: "",
  SharedResponsibilityModel: "",
  SimpleNotificationService: "",
  SimpleStorageService: "",
  StorageClass: {
    description: "classification assigned to S3 instance",
    classes: [
      {
        standard: [
          "multi AZ",
          "low latency and high thgroughput",
          "general purpose",
          "best for frequently accessed data",
        ],
      },
      {
        scIntelligentTiering: [
          "moving data automatically to the best prising storage class",
          "automatic costs savings",
          "multiple AZ",
          "no retrieval fees",
          "best for data with unknown and changing access pattern",
        ],
      },
      {
        standardIA: [
          "s3 standard infrequent access",
          "accessed infrequently but needs rapid access",
          "multiple AZ",
          "cheaper than standard s3",
        ],
      },
      {
        oneZoneIA: [
          "s3 standard infrequent access",
          "accessed infrequently but needs rapid access",
          "SINGLA AZ",
          "20% cheaper than standard s3IA",
          "data can be possibly lost",
        ],
      },
      {
        glacier: [
          "long term data storage",
          "lower costs",
          "data retrieval takes longer",
          "3 retrieval options - 1-5 minutes / 3-5 hours / 5-12 hours",
          "multi AZ",
          "long term backup",
          "cheaper",
        ],
        glacierDeepArchive: [
          "like s3 glacier but longer retrieval",
          "2 retrieval options - 12/48 hours",
          "cheapest from all s3 options",
          "multiple AZ",
          "long term data archival accessed once/twice per year",
        ],
      },
      {
        s3Outputs: [
          "object storage on premises",
          "single storage class",
          "store data across multiple devices and servers",
          "best for data that has to be kept local",
          "for application that need data to be kept close due to performance needs",
        ],
      },
    ],
  },
  Subnet:
    "Part of net e.g. part of VPC, can be private or public, can have EC2 or other services in it",
  Subscriptions: "endpoints to which SNS sends messages",
  Topics: "different endpoints in SNS that can send messages",
  TrustedAdvisor:
    "service advising and helping with optimization of aspects of your AWS account",
  UserCredentials: "IAM users username and pass to login to AWS Console",
  VirtualPrivateCloud: {
    VPC: "Private subsection of AWS that is under your control and where you can place your AWS resources",
  },
};

const pricingByTime = {
  minutes: [
    "Amazon EC2 instances (when using reserved instances or spot instances)",
    "Amazon RDS instances (when using reserved instances)",
    "Amazon Elasticache instances (when using reserved instances)",
    "AWS Elastic Beanstalk instances (when using reserved instances or spot instances)",
  ],
  hours: [
    "Amazon S3 storage",
    "Amazon Elastic Block Store (EBS) volumes",
    "Amazon Elastic File System (EFS) storage",
    "Amazon Glacier storage",
    "Amazon DynamoDB tables",
    "Amazon Simple Queue Service (SQS) queues",
    "Amazon Simple Notification Service (SNS) notifications",
    "Amazon Simple Workflow Service (SWF)",
  ],
  seconds: [
    "Amazon EC2 instances (when using on-demand instances)",
    "Amazon RDS instances (when using on-demand instances)",
    "Amazon Elasticache instances (when using on-demand instances)",
    "AWS Elastic Beanstalk instances (when using on-demand instances)",
    "Amazon Elastic Container Service (ECS)",
    "Amazon Elastic Kubernetes Service (EKS)",
    "AWS Lambda",
    "Amazon AppStream 2.0",
    "Amazon Connect",
    "Amazon Pinpoint",
    "Amazon QuickSight",
    "Amazon Transcribe",
    "Amazon Translate",
    "Amazon Comprehend",
    "Amazon Rekognition",
    "Amazon Transcribe",
    "Amazon Transcribe Medical",
    "Amazon Textract",
    "Amazon Forecast",
    "Amazon Personalize",
    "Amazon SageMaker",
    "AWS Glue",
    "Amazon EventBridge",
    "Amazon CloudFormation",
    "AWS CloudFormation",
    "AWS CloudTrail",
    "AWS CloudWatch",
    "AWS Config",
    "AWS Data Pipeline",
    "AWS Direct Connect",
    "AWS Elasticsearch Service",
    "AWS Glue Data Catalog",
    "AWS IoT",
    "AWS IoT Analytics",
    "AWS IoT Device Defender",
    "AWS IoT Events",
    "AWS IoT SiteWise",
    "AWS IoT Things Graph",
    "AWS Key Management Service",
    "AWS Resource Groups",
    "AWS Systems Manager",
    "AWS App Runner",
    "AWS CodeBuild",
    "AWS CodeCommit",
    "AWS CodeDeploy",
    "AWS CodePipeline",
    "AWS CodeStar",
    "AWS X-Ray",
    "AWS Managed Services",
  ],
};
