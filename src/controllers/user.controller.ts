import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, birthday, location } = req.body;
      if (!firstName || !lastName || !email || !birthday || !location) {
        res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, birthday, location' });
        return;
      }
      const user = await this.userService.createUser({ firstName, lastName, email, birthday, location });
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }
      const user = await this.userService.updateUser(id, req.body);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
