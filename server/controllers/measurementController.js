import { Measurement } from '../models.js';
import { createNotification } from './notificationController.js';

export async function listMeasurements(req, res) {
  try {
    const rows = await Measurement.find({ clerkUserId: req.authUserId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMeasurement(req, res) {
  try {
    const item = await Measurement.findOne({ _id: req.params.id, clerkUserId: req.authUserId }).lean();
    if (!item) return res.status(404).json({ error: 'Measurement profile not found.' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createMeasurement(req, res) {
  try {
    const { name, garment, values } = req.body;
    const cleanName = String(name || '').trim().slice(0, 80);
    const cleanGarment = String(garment || '').trim().slice(0, 60);

    if (!cleanName || !cleanGarment) {
      return res.status(400).json({ error: 'Measurement profile name and garment type are required.' });
    }

    // Sanitize values
    const cleanValues = {};
    if (values && typeof values === 'object') {
      for (const [key, val] of Object.entries(values)) {
        const num = Number(val);
        if (Number.isFinite(num) && num > 0 && num <= 500) {
          cleanValues[key.trim().slice(0, 40)] = Math.round(num * 10) / 10;
        }
      }
    }

    const created = await Measurement.create({
      name: cleanName,
      garment: cleanGarment,
      values: cleanValues,
      clerkUserId: req.authUserId,
    });

    createNotification({
      recipientClerkUserId: req.authUserId,
      title: 'Measurement Profile Created',
      message: `Profile '${cleanName}' for ${cleanGarment} has been saved to your account.`,
      type: 'measurement',
      link: '/dashboard',
      metadata: { profileId: created._id, name: cleanName },
    }).catch(() => {});

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateMeasurement(req, res) {
  try {
    const update = {};
    if (typeof req.body.name === 'string') {
      const cleanName = req.body.name.trim().slice(0, 80);
      if (!cleanName) return res.status(400).json({ error: 'Profile name cannot be empty.' });
      update.name = cleanName;
    }
    if (typeof req.body.garment === 'string') {
      const cleanGarment = req.body.garment.trim().slice(0, 60);
      if (!cleanGarment) return res.status(400).json({ error: 'Garment type cannot be empty.' });
      update.garment = cleanGarment;
    }
    if (req.body.values && typeof req.body.values === 'object') {
      const cleanValues = {};
      for (const [key, val] of Object.entries(req.body.values)) {
        const num = Number(val);
        if (Number.isFinite(num) && num > 0 && num <= 500) {
          cleanValues[key.trim().slice(0, 40)] = Math.round(num * 10) / 10;
        }
      }
      update.values = cleanValues;
    }

    update.updatedAt = new Date();

    const item = await Measurement.findOneAndUpdate(
      { _id: req.params.id, clerkUserId: req.authUserId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ error: 'Measurement profile not found.' });

    createNotification({
      recipientClerkUserId: req.authUserId,
      title: 'Measurement Profile Updated',
      message: `Profile '${item.name}' has been updated successfully.`,
      type: 'measurement',
      link: '/dashboard',
      metadata: { profileId: item._id, name: item.name },
    }).catch(() => {});

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteMeasurement(req, res) {
  try {
    const item = await Measurement.findOneAndDelete({ _id: req.params.id, clerkUserId: req.authUserId });
    if (!item) return res.status(404).json({ error: 'Measurement profile not found.' });
    res.json({ deleted: true, id: req.params.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
