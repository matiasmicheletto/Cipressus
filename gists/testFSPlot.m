close all; clear all;

data = [-1, -1, -5, 1;
-5, -3, -5, -3;
1, 1, 3, -3;
-1, -5, -5, -5;
-5, -5, -3, -7;
-9, -5, -1, -1;
-7, -5, -11, 1;
7, -5, -5, -3;
-1, 5, -3, -1;
3, -5, -3, -1;
5, 1, -7, -3;
-7, 1, -7, -5;
-7, 1, -5, 3;
-7, -1, 5, -11;
3, -5, -1, -1;
7, 1, 7, -3;
-1, 1, -3, -1;
-3, 3, 1, -3;
-3, -3, -9, 1;
3, 9, 3, 3;
-5, -1, 5, -3;
-7, -5, -5, -1;
-5, 1, 1, -1;
-9, -1, -3, -1;
-1, -1, -3, -1;
-1, -3, -3, -3;
-5, 3, -7, -3;
1, -1, -7, 5;
-1, 3, 5, -9;
-7, -7, -7, -3;
-1, -1, -5, 1;
-1, 9, -1, -3];


subplot(2,2,1); histfit(data(:,1), 10); grid
axis([-11,11,0,12]);
title('Escala Activo-Reflexivo');
xlabel(['\mu = ',num2str(mean(data(:,1))), ' \sigma^2 = ',num2str(std(data(:,1)))]);
ylabel('Frecuencia');

subplot(2,2,2); histfit(data(:,2), 10); grid
axis([-11,11,0,12]);
title('Escala Sensorial-Intuitivo');
xlabel(['\mu = ',num2str(mean(data(:,2))), ' \sigma^2 = ',num2str(std(data(:,2)))]);
ylabel('Frecuencia');

subplot(2,2,3); histfit(data(:,3), 10); grid
axis([-11,11,0,12]);
title('Escala Visual-Verbal');
xlabel(['\mu = ',num2str(mean(data(:,3))), ' \sigma^2 = ',num2str(std(data(:,3)))]);
ylabel('Frecuencia');

subplot(2,2,4); histfit(data(:,4), 10); grid
axis([-11,11,0,12]);
title('Escala Secuencial-Global');
xlabel(['\mu = ',num2str(mean(data(:,4))), ' \sigma^2 = ',num2str(std(data(:,4)))]);
ylabel('Frecuencia');