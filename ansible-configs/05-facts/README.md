ansible all -m setup -- wyswietla wszystkie zgromadzone fakty na temat hostów

ansible all -m setup -a 'filter=ansible_all_ipv6_addresses' - można filtrować fakty, poniewż zazwyczaj ta lista jest bardzo długa

można dodawać fakty lokalne - w pliku /etc/ansible/facts.d/nazwa_pliku.fact - plik trzeba umieścic na serwerze na którym uruchamiamy playbook, plik powinien mieć format yaml albo json, albo executable, bez argumentów który wyswietla info w formie json
