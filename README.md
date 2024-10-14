# DataSculpt

![pixelcut-export (1).png](https://cdn.dorahacks.io/static/files/1928a875de8f9ac54e7e93b4728b0dab.png)

## Introduction

At its core, this project promotes user control, privacy, and fair compensation within a collaborative environment, transforming how contributions are recognized and rewarded in a data-driven landscape. As decentralized solutions reshape user engagement, the Decentralized Data Labeling Platform on the Aptos blockchain offers a unique approach to fulfilling the demand for high-quality data in artificial intelligence.

This platform enables users to create customizable tasks for contributors while ensuring automatic compensation upon completion. A robust reputation system fosters trust and accuracy, allowing users to easily upload datasets in CSV format and access their results through intuitive dashboards. By leveraging Aptos' fast and secure infrastructure, the platform enhances efficiency and transparency, showcasing how innovative technology can empower communities.


### Demo Video

[Click here to watch the demo video](https://youtu.be/f_S0T38ucyU)

### Live Link

[Explore DataScult here](https://datasculpt.vercel.app)

### Github Link

[Explore the Github Repo here](https://github.com/preyanshu/datasculpt)

## Working


The following steps outline how **DataSculpt** functions :

## For Creators :

1. **Connect Wallet and Register:**
   - Creators begin by connecting their Aptos-compatible wallet and registering on the platform. This ensures secure interactions and facilitates job creation.
   
   
   ![Connect Wallet](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20142028.png)


![User Registration](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic7.png)

1. **Create Job and Upload Data:**
   - After registration, creators can access the job creation interface. They select the type of data they want to upload and then they can then upload the dataset in CSV format.
   

![Upload csv file containing tasks](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic8.png)


1. **Set Task Parameters and Confirm Job:**
   - Creators define specific parameters for the tasks, including the number of workers needed per task, predetermined answers etc. Once these details are set, they can pay and confirm the creation of the job.
   
   
![Job analysis](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic9.png)


![Verify Questions](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic10.png)


![create job](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic11.png)

1. **Monitor Progress and Download Results:**
   -Creators can monitor the progress of the job through their dashboard, which provides updates on task completion and worker performance. They can review the labeled data and download the labeled CSV files directly from their dashboard.

   ![](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic4.png)

![enter image description here](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20143921.png)
## For Workers :

1. **Connect Wallet and Register:**
   Workers start by connecting their Aptos-compatible wallet and registering on the platform.
   
![Connect Wallet](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20142028.png)


![worker registory](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20144358.png)

1. **Browse Available Tasks:**
   After registration, workers can browse a list of available tasks.
   
![workers dashboard](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic1.png)

![tasks for workers](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic3.png)



1. **Pick and Complete Tasks:**
   Workers select tasks they wish to complete. They submit their answers, and if a task has a predetermined answer and the worker's response is incorrect, it negatively affects their reputation. However, successful completion of the task results in payment.

![pick and complete task](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic5.png)


![enter image description here](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20145949.png)

1. **Monitor Task Insights:**
In their dashboard, workers can view a list of completed tasks. They can see the percentage of people who chose each option. This feature helps them gauge the percentage of different responses and better understand task dynamics.

![workers profile](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/pic6.png)

![enter image description here](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20150349.png)

1. **Withdraw Earnings:**
Workers can withdraw their earnings directly from their dashboard ,providing a smooth and efficient payout process.

   ![withdraw](https://raw.githubusercontent.com/preyanshu/datasculpt/refs/heads/master/public/assets/Screenshot%202024-10-14%20150559.png)

  
## Behind the Scenes


### Tech Stack

DataSculpt leverages modern technologies to provide a seamless experience for users:

-   **Frontend:** Built with Next.js for a fast, dynamic user interface, styled with Tailwind CSS for responsive design, and enhanced with Framer Motion for smooth animations and interactions.
-   **Blockchain:** Aptos blockchain to securely handle task assignments and automate payments.
-   **Smart Contracts:** Written in Move, the smart contracts manage job creation, task validation, payment distribution, and reputation tracking.
