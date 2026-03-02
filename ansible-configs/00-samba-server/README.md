# Samba Server with Docker on Thin Client (HP T610)

This Ansible playbook sets up a Samba file server inside a Docker container on a low-powered thin client (like the HP T610). It’s perfect for creating a small and lightweight home/office file share over the local network.

## What This Does

- Creates a persistent shared folder on the host: `/srv/samba_share`
- Spins up a `dperson/samba` Docker container with:
  - Open ports: 139 and 445
  - Samba user and password defined in encrypted vault
  - One shared folder accessible from Linux/Windows clients
- Keeps the container running with restart policy

## Requirements

- Target machine with:
  - Docker installed and running
  - SSH access (configured in `inventory/hosts.ini`)
- Control machine with:
  - Ansible 2.10+ installed
  - Vault password for decrypting secrets

## Sensitive Data

Samba credentials (`samba_user`, `samba_pass`) are stored in an **Ansible Vault-encrypted file**:

```bash
host_vars/node1hp/vault.yml
```

Make sure you have the vault password before running the playbook.

## How to Run

Run the playbook manually from this folder:

```bash
ansible-playbook -i inventory/hosts.ini playbooks/samba.yml --vault-id @prompt
```

You’ll be prompted for the vault password.

## Notes

- The Samba container will restart automatically on boot or failure.
- The share is mapped to /srv/samba_share on the host.
- To access it from a Linux machine:
  ```bash
  smbclient //node1hp/share -U your_username
  ```
- Or just mount it and use as catalog:
  ```bash
  sudo mount -t cifs //192.168.X.X/share ~/samba_share -o username=[username]
  ```
- From Windows: open the Windows Explorer and fill in the address:
  ```bash
  \\192.168.X.X\share
  ```

## Why Manual?

This is a simple home-lab setup. I don’t run this playbook from CI/CD (e.g., GitHub Actions) to avoid uploading SSH keys or secrets to remote systems. It’s designed to be run manually when needed.

## Project Structure

```bash
00-samba-server/
├── ansible.cfg
├── inventory/
│   └── hosts.ini
├── playbooks/
│   └── samba.yml
├── host_vars/
│   └── node1hp/
│       └── vault.yml (encrypted)
```
